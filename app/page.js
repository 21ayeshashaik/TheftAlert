import ObjectDetection from "@/components/object-detection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="gradient-title font-extrabold text-3xl md:text-6xl lg:text-8xl tracking-tighter md:px-6 text-center">
        Theft Surveillance
      </h1>
      <p className="text-gray-400 mb-8 mt-2 text-lg text-center max-w-2xl px-4">
        Advanced AI-powered security system. Set your target, arm the alarm, and catch intruders in real-time.
      </p>
      <ObjectDetection />
    </main>
  );
}
