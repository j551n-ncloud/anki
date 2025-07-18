import { Alert, Autocomplete, Button, Box, Card, CardActions, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Divider, Typography, Snackbar } from '@mui/material';

import { useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useState, useEffect } from 'react';

import { addNote, fetchDecks, fetchTags } from './anki';
import { suggestAnkiNotes } from './openai';
import { OpenAIKeyContext } from './OpenAIKeyContext';
import useLocalStorage from './useLocalStorage';
import FileUpload from './FileUpload';
import { parseFileContent, generatePromptFromParsedData } from './fileParser';

interface Note {
    modelName: string;
    deckName: string;
    fields: { Front: string, Back: string };
    tags: string[];
    key: string;
    trashed?: boolean;
    created?: boolean;
}

interface CardProps {
    note: Note;
    onTrash: () => void;
    onCreate: () => void;
}

const NoteComponent: React.FC<CardProps> = ({ note, onTrash, onCreate }) => {
    const [currentNote, setCurrentNote] = useState(note);
    const { modelName, deckName, fields, tags, trashed, created } = currentNote;

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (name) {
            setCurrentNote(prev => ({
                ...prev,
                fields: { ...prev.fields, [name]: value }
            }));
        }
    };

    const handleTagsChange = (_: any, tags: string[]) => {
        setCurrentNote(prev => ({
            ...prev,
            tags
        }));
    };

    const { isLoading, mutate } = useMutation({
        mutationFn: addNote,
        onSuccess: (_) => onCreate()
    })

    const { data: allTags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"]
    });

    return !trashed && !created && (
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Deck"
                                value={deckName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Note type"
                                value={modelName}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                id="tags"
                                multiple
                                autoHighlight
                                freeSolo
                                value={tags}
                                options={allTags || []}
                                onChange={handleTagsChange}
                                renderInput={(params) => <TextField label="Tags" {...params} />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Front"
                                value={fields.Front}
                                multiline
                                onChange={handleFieldChange}
                                name="Front"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Back"
                                value={fields.Back}
                                multiline
                                onChange={handleFieldChange}
                                name="Back"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions>
                    <Button size="small" color="secondary" onClick={() => onTrash()}>
                        Trash
                    </Button>
                    <Button size="small" color="primary" onClick={() => mutate(currentNote)}
                        disabled={isLoading} >
                        Add note
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
};

interface Options {
    deckName: string;
    modelName: string;
    prompt: string;
    tags: string[];
}

function Home() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const promptParam = query.get('prompt') || "";
    const textParam = query.get('text') || "";

    const initialPrompt = textParam || promptParam || "";

    const { data: decks, error: ankiError } = useQuery({
        queryFn: fetchDecks,
        queryKey: ["decks"],
        retry: false
    });

    const { data: tags } = useQuery({
        queryFn: fetchTags,
        queryKey: ["tags"],
    });

    const [notes, setNotes] = useState<Note[]>([]);
    const [processingFile, setProcessingFile] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [deckName, setDeckName] = useLocalStorage("deckName", "Default");
    const [modelName, setModelName] = useState("Basic");
    const [currentTags, setCurrentTags] = useLocalStorage<string[]>("tags", []);
    const [prompt, setPrompt] = useState(initialPrompt);
    
    const { openAIKey } = useContext(OpenAIKeyContext);

    const { isLoading, mutate, error: openAIError } = useMutation({
        mutationFn: (data: Options) => suggestAnkiNotes(openAIKey, data, notes),
        onSuccess: (newNotes) => {
            if (newNotes && newNotes.length > 0) {
                setNotes(notes => [...notes, ...newNotes]);
                setSuccessMessage(`Successfully generated ${newNotes.length} new flashcards`);
            } else {
                setFileError("No flashcards could be generated. Please try a different prompt or file.");
            }
        },
        onError: (error) => {
            console.error("Error generating flashcards:", error);
            setFileError(`Error generating flashcards: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    // Handle file upload content
    const handleFileContent = async (content: string | ArrayBuffer, fileName: string) => {
        try {
            setProcessingFile(true);
            setFileError(null);
            
            // Extract file extension
            const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
            
            // Process file based on type
            console.log(`Processing file: ${fileName} (${fileExt})`);
            
            // Show specific loading message based on file type
            let loadingMessage = "Processing file...";
            if (fileExt === 'pdf') {
                loadingMessage = "Extracting text from PDF...";
                setSuccessMessage(loadingMessage);
            }
            
            // Parse file content based on type
            const parsedData = await parseFileContent(content, fileName);
            
            // Set loading message for prompt generation
            setSuccessMessage("Generating flashcard prompt...");
            
            const generatedPrompt = generatePromptFromParsedData(parsedData);
            
            console.log(`File parsed successfully: ${parsedData.format} format`);
            console.log(`Generated prompt length: ${generatedPrompt.length} characters`);
            
            if (generatedPrompt && generatedPrompt.trim().length > 0) {
                // Just set the prompt state without automatically generating cards
                setPrompt(generatedPrompt);
                setSuccessMessage(`File processed: ${fileName}. Ready to generate cards.`);
            } else {
                setFileError(`Could not generate a valid prompt from ${fileName}`);
            }
        } catch (error) {
            console.error("Error processing file:", error);
            setFileError(`Error processing file: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setProcessingFile(false);
        }
    };

    // Handle file list changes
    const handleFileListChange = (files: File[]) => {
        console.log(`File list updated: ${files.length} files`);
    };

    // If there's an initial prompt param, kick it off immediately
    useEffect(() => {
        if (initialPrompt && initialPrompt.trim() !== "") {
            console.log("Initial prompt found, generating cards...");
            mutate({ deckName, modelName, tags: currentTags, prompt: initialPrompt });
        }
    }, []);

    // Manual card generation handler
    const handleGenerateCards = () => {
        if (!prompt || prompt.trim() === "") {
            setFileError("Please enter a prompt before generating cards.");
            return;
        }
        
        console.log("Generating cards with prompt:", prompt.substring(0, 100) + "...");
        setFileError(null);
        mutate({ deckName, modelName, tags: currentTags, prompt });
    };

    // Close the success notification
    const handleCloseSuccess = () => {
        setSuccessMessage(null);
    };

    return (
        <Grid container sx={{ padding: "25px", maxWidth: 1200 }} spacing={4} justifyContent="flex-start"
            direction="column"
        >
            {ankiError ?
                <Alert severity="error" sx={{ marginTop: "20px", marginLeft: "25px" }}>Error: We can't connect to Anki using AnkiConnect. Please make sure Anki is running and you have the AnkiConnect plugin enabled, and that you have set the CORS settings.</Alert>
                : <></>}
            {openAIError ?
                <Alert severity="error" sx={{ marginTop: "20px", marginLeft: "25px" }}>Error: We can't connect to AI Provider. Ensure you have entered your OpenAI key correctly.</Alert>
                : <></>}
            {fileError ?
                <Alert severity="error" sx={{ marginTop: "20px", marginLeft: "25px", marginBottom: "10px" }}>{fileError}</Alert>
                : <></>}
                
            <Grid container item direction="column" spacing={2} justifyContent="flex-start">
                <Grid item>
                    <Typography variant="h6" gutterBottom>
                        Create Cards from Text
                    </Typography>
                </Grid>
                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel id="deck-label">Deck</InputLabel>
                        <Select
                            labelId="deck-label"
                            label="Deck"
                            id="deck"
                            value={deckName}
                            onChange={e => { e.target.value && setDeckName(e.target.value) }}
                        >
                            {decks && decks.map(deckName =>
                                <MenuItem key={"deck" + deckName} value={deckName}>{deckName}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth>
                        <InputLabel id="model-label">Note type</InputLabel>
                        <Select
                            labelId="model-label"
                            label="Note type"
                            id="model"
                            value={modelName}
                            onChange={e => { e.target.value && setModelName(e.target.value) }}
                        >
                            <MenuItem value="Basic">Basic</MenuItem>
                            <MenuItem value="Basic (and reversed card)">Basic (and reversed card)</MenuItem>
                            <MenuItem value="Cloze">Cloze</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth>
                        <Autocomplete
                            id="tags"
                            multiple
                            autoHighlight
                            value={currentTags}
                            options={tags || []}
                            onChange={(_, value) => { value && setCurrentTags(value) }}
                            freeSolo
                            renderInput={(params) => <TextField label="Tags" {...params} />}
                        />
                    </FormControl>
                </Grid>
                
                {/* Add the file upload component with PDF support */}
                <Grid item>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Upload Files
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Upload files to generate flashcards from their content
                    </Typography>
                    <FileUpload 
                        onFileContent={handleFileContent}
                        acceptedFileTypes=".txt,.md,.csv,.json,.pdf"
                        onFileListChange={handleFileListChange}
                    />
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid item>
                    <FormControl fullWidth>
                        <TextField
                            id="prompt"
                            label="Prompt"
                            maxRows={10}
                            multiline
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Enter text to generate flashcards or use the file upload above"
                        />
                    </FormControl>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isLoading || processingFile || !prompt.trim()}
                        onClick={handleGenerateCards}
                    >
                        Suggest cards
                    </Button>
                </Grid>
            </Grid>
            <Grid container item>
                {(isLoading || processingFile) && (
                    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
                        <CircularProgress />
                        <Typography variant="body2" color="textSecondary" mt={1}>
                            {processingFile ? "Processing file..." : "Generating flashcards..."}
                        </Typography>
                    </Box>
                )}
            </Grid>
            
            {/* Display card count */}
            {notes.filter(n => !n.trashed && !n.created).length > 0 && (
                <Grid container item>
                    <Typography variant="subtitle1" gutterBottom>
                        Generated Cards ({notes.filter(n => !n.trashed && !n.created).length})
                    </Typography>
                </Grid>
            )}
            
            <Grid container item spacing={2} alignItems="stretch">
                {notes
                    .filter(n => !n.trashed)
                    .filter(n => !n.created)
                    .map((note) =>
                        <NoteComponent
                            key={note.key}
                            note={note}
                            onTrash={() => {
                                setNotes(notes => notes.map((n) => note.key === n.key ? { ...n, trashed: true } : n))
                            }}
                            onCreate={() => {
                                setNotes(notes => notes.map((n) => note.key === n.key ? { ...n, created: true } : n))
                            }}
                        />
                    )}
            </Grid>
            
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={handleCloseSuccess}
                message={successMessage}
            />
        </Grid>
    );
}

export default Home;