import { Alert, Autocomplete, Button, Card, CardActions, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Divider, Typography } from '@mui/material';

import { useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useState, useEffect } from 'react';

import { addNote, fetchDecks, fetchTags } from './anki';
import { suggestAnkiNotes } from './openai';
import { OpenAIKeyContext } from './OpenAIKeyContext';
import useLocalStorage from './useLocalStorage';
import FileUpload from './FileUpload';
import { parseFileContent, generatePromptFromParsedData, ParsedData } from './fileParser';

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

    const [deckName, setDeckName] = useLocalStorage("deckName", "Default");
    const [modelName, setModelName] = useState("Basic");
    const [currentTags, setCurrentTags] = useLocalStorage<string[]>("tags", []);
    const [prompt, setPrompt] = useState(initialPrompt);
    
    const { openAIKey } = useContext(OpenAIKeyContext);

    const { isLoading, mutate, error: openAIError } = useMutation({
        mutationFn: (data: Options) => suggestAnkiNotes(openAIKey, data, notes),
        onSuccess: (newNotes) => {
            setNotes(notes => [...notes, ...newNotes]);
        }
    });

    // Handle file upload content
    const handleFileContent = (content: string, fileName: string) => {
        try {
            setProcessingFile(true);
            setFileError(null);
            
            const parsedData = parseFileContent(content, fileName);
            const generatedPrompt = generatePromptFromParsedData(parsedData);
            
            setPrompt(generatedPrompt);
            setProcessingFile(false);
        } catch (error) {
            setFileError(`Error processing file: ${error instanceof Error ? error.message : String(error)}`);
            setProcessingFile(false);
        }
    };

    // If there's an initial prompt param, kick it off immediately
    useEffect(() => {
        if (initialPrompt !== "") {
            mutate({ deckName, modelName, tags: currentTags, prompt: initialPrompt });
        }
    }, []);

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
                <Alert severity="error" sx={{ marginTop: "20px", marginLeft: "25px" }}>{fileError}</Alert>
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
                
                {/* Add the file upload component */}
                <Grid item>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Upload Files
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Upload files to generate flashcards from their content
                    </Typography>
                    <FileUpload 
                        onFileContent={(content, fileName) => handleFileContent(content, fileName)}
                        acceptedFileTypes=".txt,.md,.csv,.json"
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
                        />
                    </FormControl>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isLoading || processingFile || !prompt.trim()}
                        onClick={(_) => mutate({ deckName, modelName, tags: currentTags, prompt })}>
                        Suggest cards
                    </Button>
                </Grid>
            </Grid>
            <Grid container item>
                {(isLoading || processingFile) && <CircularProgress />}
            </Grid>
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
        </Grid>
    );
}

export default Home;