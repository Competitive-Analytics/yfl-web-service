export default function PrivacyView() {
  return (
    <div className="container mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2 text-sm">Last updated: December 1, 2025</p>
        <hr className="mt-6" />
      </header>

      {/* Content */}
      <div className="space-y-10 text-[15px] leading-7 text-foreground/90">
        <section className="space-y-4">
          <p>
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you access or use our platform
            (“Service”). By using the Service, you consent to the practices
            described in this Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Information We Collect</h2>
          <p>We may collect information in the following ways:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold">Information you provide directly:</span>{" "}
              Such as your name, email address, and any content or preferences
              you submit while using the Service.
            </li>
            <li>
              <span className="font-semibold">Information collected automatically:</span>{" "}
              Such as log data, usage information, device identifiers, IP
              address, browser type, and pages you visit.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, operate, and maintain the Service</li>
            <li>Personalize and improve your experience</li>
            <li>Communicate with you, including sending updates or support responses</li>
            <li>Monitor usage, security, and performance of the platform</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">How We Share Information</h2>
          <p>
            We do not sell your personal information. We may share information in
            the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold">Service providers:</span> With
              trusted third-party vendors who assist with hosting, analytics, or
              customer support.
            </li>
            <li>
              <span className="font-semibold">Legal requirements:</span> When
              disclosure is necessary to comply with applicable laws,
              regulations, or legal processes.
            </li>
            <li>
              <span className="font-semibold">Protection of rights:</span> When
              needed to protect the security or integrity of the Service or the
              safety of our users.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Your Choices &amp; Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding
            your personal information, which can include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Requesting access to or a copy of your data</li>
            <li>Correcting or updating inaccurate information</li>
            <li>
              Requesting deletion of your information, subject to our legal or
              contractual obligations
            </li>
            <li>Opting out of certain communications from us</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p>
            We implement reasonable administrative, technical, and physical
            safeguards designed to protect your information. However, no method
            of transmission over the internet or electronic storage is
            completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will
            be posted on this page with an updated “Last updated” date. Your
            continued use of the Service after changes become effective
            constitutes acceptance of the revised Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>
            If you have any questions about this Privacy Policy or how your
            information is handled, please contact us at our support email.
          </p>
        </section>
      </div>
    </div>
  );
}
