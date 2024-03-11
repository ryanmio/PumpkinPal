export default function Component() {
    return (
      <div className="grid gap-12 px-4 md:px-6 lg:gap-12">
        <div className="space-y-2 text-left">
          <h1 className="text-3xl pt-12 font-bold tracking-tighter sm:text-4xl md:text-5xl/none">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: January 1, 2024</p>
        </div>
        <div className="space-y-6 pb-20 text-left">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Introduction</h2>
            <p>
              Welcome to the PumpkinPal Privacy Policy. This Privacy Policy describes how PumpkinPal ("we," "our," or
              "us") collects, uses, and shares information about you when you use our mobile application (the "Service").
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you use the Service. For example, we collect
              information when you create an account, log in to your account, participate in a contest or promotion,
              communicate with us via third-party social media sites, request customer support, or otherwise communicate
              with us.
            </p>
            <p>
              The types of information we may collect include your name, email address, profile picture, and any other
              information you choose to provide.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">How We Use Your Information</h2>
            <p>
              We may use the information we collect from you when you register, make a purchase, sign up for our
              newsletter, respond to a survey or marketing communication, surf the website, or use certain other site
              features in the following ways:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                To personalize your experience and to allow us to deliver the type of content and product offerings in
                which you are most interested.
              </li>
              <li>To improve our website in order to better serve you.</li>
              <li>To allow us to better service you in responding to your customer service requests.</li>
              <li>To administer a contest, promotion, survey or other site feature.</li>
              <li>To send periodic emails regarding your order or other products and services.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Consent</h2>
            <p>
              By using the Service, you consent to our collection, use, and disclosure of your information as described in
              this Privacy Policy.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Third-Party Services</h2>
            <p>
              The Service may contain links to third-party websites or services that are not owned or controlled by
              PumpkinPal. We have no control over and assume no responsibility for the content, privacy policies, or
              practices of any third-party websites or services.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your Rights</h2>
            <p>
              You have the right to access, update, or delete your information. If you would like to exercise this right,
              please contact us using the contact information provided below.
            </p>
          </div>
        </div>
      </div>
    )
  }