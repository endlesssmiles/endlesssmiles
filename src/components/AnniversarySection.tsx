import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Confetti {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  animationDuration: number;
}

const AnniversarySection = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [revealMessage, setRevealMessage] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      generateConfetti();
    }
  }, [showConfetti]);

  const generateConfetti = () => {
    const colors = ["#F75D77", "#FDE1D3", "#FFD1DC", "#FFF0F5", "#FFC0CB"];
    const newConfetti: Confetti[] = [];

    for (let i = 0; i < 100; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 80, // Start above the viewport
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: Math.random() * 3 + 3,
      });
    }

    setConfetti(newConfetti);
  };

  const handleTriggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setRevealMessage(true);
    }, 1000);
  };

  return (
    <section
      id="anniversary"
      className="py-20 px-4 bg-soft-gradient relative overflow-hidden"
    >
      <div className="container mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-love-600 mb-4">
          Our First Anniversary
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Ek saal humare pyaar, takraar,khushi aur junnun ka😘
        </p>

        <div className="max-w-3xl mx-auto">
          <Card
            className={`bg-white border-none shadow-soft transition-all duration-500 ${
              revealMessage ? "transform scale-105" : ""
            }`}
          >
            <CardContent className="p-8 text-center">
              {!showConfetti ? (
                <>
                  <p className="text-xl text-gray-700 mb-8">
                    Click the button below to reveal a special anniversary
                    message.
                  </p>
                  <button
                    onClick={handleTriggerConfetti}
                    className="bg-love-500 hover:bg-love-600 text-white font-medium px-8 py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
                  >
                    Reveal Anniversary Surprise
                  </button>
                </>
              ) : (
                <div className="animate-fade-in">
                  <h3 className="text-3xl md:text-4xl font-handwritten text-love-600 mb-6">
                    Happy 1st Anniversary, My Mikku, My Love ❤️
                  </h3>
                  {revealMessage && (
                    <div className="animate-fade-in">
                      <p className="text-xl text-gray-700 mb-8 font-serif">
                        Ek saal pehele aapne mujhe haa bola tha... aur kaafi
                        mushkile bhi aai par still humne ek dusre ka saath nhi
                        choda and we continued and completed our 1st
                        Anniversary🤩🤩.
                      </p>
                      <p className="text-lg text-gray-600 mb-8">
                        Aap hei meri saab kuch ho... and aapko kabhi chodhke nhi
                        jaunga and aapko bhi jane nhi dunga😤😤...aap bass meri
                        ho samjhi😤🥺... and 1st year jo jaise taise kaat
                        gaya... but main dikkate 2nd year mai hei aati hai... so
                        hope so ye 2nd year humara aur bhi achha jaye 1st year
                        se and koi bhi mushkile na aaye😌🙏😘😘
                      </p>
                      <div className="text-love-500 text-6xl font-handwritten">
                        I love you!
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map((item) => (
            <div
              key={item.id}
              className="absolute animate-confetti"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.size}px`,
                height: `${item.size}px`,
                backgroundColor: item.color,
                borderRadius: "50%",
                animationDuration: `${item.animationDuration}s`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AnniversarySection;
