
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";

const LegalNotice = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Legal Notice (Impressum)</CardTitle>
            <CardDescription>Information according to § 5 TMG</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mt-4">Service Provider</h2>
            <address className="not-italic mt-2">
              Johannes Nguyen<br />
              Heinrich-böll-straße 28<br />
              68723 Oftersheim<br />
              Germany
            </address>

            <h2 className="text-2xl font-semibold mt-6">Contact Information</h2>
            <p>
              Email: [Your email address]<br />
              Phone: [Your phone number]
            </p>

            <h2 className="text-2xl font-semibold mt-6">VAT Identification Number</h2>
            <p>
              VAT ID: [Your VAT ID, if applicable]
            </p>

            <h2 className="text-2xl font-semibold mt-6">Responsible for Content (§ 55 Abs. 2 RStV)</h2>
            <address className="not-italic mt-2">
              Johannes Nguyen<br />
              Heinrich-böll-straße 28<br />
              68723 Oftersheim<br />
              Germany
            </address>

            <h2 className="text-2xl font-semibold mt-6">EU Dispute Resolution</h2>
            <p>
              The European Commission provides a platform for online dispute resolution (OS): 
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="ml-1">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-2">
              We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Liability for Content</h2>
            <p>
              As a service provider, we are responsible for our own content on these pages according to Section 7, Paragraph 1 of the German Telemedia Act (TMG). 
              However, according to Sections 8 to 10 of the TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate 
              circumstances that indicate illegal activity.
            </p>
            <p className="mt-2">
              Obligations to remove or block the use of information under general law remain unaffected. However, liability in this regard is only possible from 
              the moment knowledge of a specific infringement is obtained. Upon becoming aware of corresponding infringements, we will remove this content immediately.
            </p>

            <h2 className="text-2xl font-semibold mt-6">Copyright</h2>
            <p>
              The content and works on these pages created by the site operators are subject to German copyright law. Duplication, processing, distribution, and any 
              form of commercialization of such material beyond the scope of the copyright law require the prior written consent of its respective author or creator. 
              Downloads and copies of these pages are only permitted for private, non-commercial use.
            </p>
            <p className="mt-2">
              Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content 
              is marked as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. Upon notification of violations, 
              we will remove such content immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LegalNotice;
