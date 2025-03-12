export function HowItWorks() {
  return (
    <div id="howitworks" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How HirePrompt Works
          </h2>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Three simple steps to transform your interview process
          </p>
        </div>
        <div className="mt-12 sm:mt-16">
          <div className="relative">
            <div className="absolute inset-0 h-1/2 bg-gray-50"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                  <div className="flex flex-col p-6 text-center sm:border-r sm:border-gray-200">
                    <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                      Upload Resume
                    </dt>
                    <dd className="order-1 text-5xl font-extrabold text-primary-600">1</dd>
                    <p className="order-3 mt-4 text-sm text-gray-500">Simply upload candidate resumes or drag and drop PDF files</p>
                  </div>
                  <div className="flex flex-col p-6 text-center sm:border-r sm:border-gray-200">
                    <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                      Add Job Details
                    </dt>
                    <dd className="order-1 text-5xl font-extrabold text-primary-600">2</dd>
                    <p className="order-3 mt-4 text-sm text-gray-500">Enter job title, required skills, and any specific details you want to focus on</p>
                  </div>
                  <div className="flex flex-col p-6 text-center">
                    <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                      Get Questions
                    </dt>
                    <dd className="order-1 text-5xl font-extrabold text-primary-600">3</dd>
                    <p className="order-3 mt-4 text-sm text-gray-500">Receive a customized list of interview questions to help you make the best hiring decision</p>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
