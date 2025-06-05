'use client'

export default function Home() {
  const sendEmail = async () => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'techguru0411@gmail.com',
        timestamp: new Date().toISOString(),
        reportId: '12345678-1234-1234-1234-123456789012',
        formattedContent: 'This is a test report',
      }),
    });
    const data = await response.json();
    console.log(data);
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to the Home Page</h1>
        <p className="text-lg">This is the main content of the home page.</p>
        <div className="flex justify-center w-full">
          <button onClick={sendEmail} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Send Email</button>
        </div>
      </main>
    </div>
  );
}
