
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Statement</CardTitle>
            <CardDescription>Last updated: April 6, 2025</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mt-4">1. Overview</h2>
            <p>
              This Privacy Statement explains how FlashForge AI ("we", "us", "our") collects, uses, and protects your personal data when you use our application. 
              We are committed to ensuring the privacy and security of your personal information in compliance with the General Data Protection Regulation (GDPR) 
              and applicable German data protection laws.
            </p>

            <h2 className="text-2xl font-semibold mt-6">2. Data Controller</h2>
            <p>
              The data controller responsible for the processing of your personal data is:
            </p>
            <address className="not-italic mt-2">
              Johannes Nguyen<br />
              Heinrich-böll-straße 28<br />
              68723 Oftersheim<br />
              Germany
            </address>

            <h2 className="text-2xl font-semibold mt-6">3. Personal Data We Collect</h2>
            <p>
              We collect and process the following personal data:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>API keys that you provide to use third-party services</li>
              <li>User preferences and settings</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6">4. Purpose of Data Processing</h2>
            <p>
              We process your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>To provide and maintain our application</li>
              <li>To customize your experience</li>
              <li>To improve our application</li>
              <li>To communicate with you</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6">5. Legal Basis for Processing</h2>
            <p>
              We process your personal data on the following legal grounds:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Your consent</li>
              <li>Performance of a contract</li>
              <li>Our legitimate interests</li>
              <li>Compliance with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6">6. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, 
              including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>

            <h2 className="text-2xl font-semibold mt-6">7. Your Rights</h2>
            <p>
              Under the GDPR and German data protection laws, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-6">8. Contact Information</h2>
            <p>
              If you have any questions about this Privacy Statement or our data practices, please contact us at:
            </p>
            <address className="not-italic mt-2">
              Johannes Nguyen<br />
              Heinrich-böll-straße 28<br />
              68723 Oftersheim<br />
              Germany<br />
              Email: [Your email address]
            </address>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
