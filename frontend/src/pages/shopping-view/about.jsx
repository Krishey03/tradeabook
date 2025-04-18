import { BookOpen, Shield, MessageSquare, DollarSign, Repeat, Layout } from "lucide-react";
import "@fontsource/inspiration";
import "@fontsource/inika";
import "@fontsource/nunito-sans";
import "@fontsource/julius-sans-one";

export default function AboutPage() {
  return (
<div className="min-h-screen bg-white from-amber-50 to-white font-['Nunito_Sans']">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] bg-repeat opacity-20"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-amber-900 mb-6 tracking-tight font-['Julius_Sans_One']">
              About <span className="text-amber-600">Trade a Book</span>
            </h1>
            <div className="w-24 h-1 bg-amber-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              A community-driven platform where book lovers can buy, sell, or exchange books with one another.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 mb-16 transform transition-all hover:shadow-2xl duration-300">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Books on a shelf"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-amber-800 mb-4 font-['Julius_Sans_One']">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Trade a Book</strong> aims to make book trading easier, more secure, and environmentally
                  friendly.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you have textbooks from previous semesters or novels you'd like to pass on, our platform helps
                  you connect with people looking for those exact titles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-amber-800 mb-12 font-['Julius_Sans_One']">
            What We Offer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]"
              >
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-800 mb-2 font-['Julius_Sans_One']">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr/>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-amber-800 mb-6 font-['Julius_Sans_One']">
            Our Values
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-10">
            We believe that every book deserves a second life — let's trade knowledge and stories together.
          </p>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: "Bidding System",
    description: "Get competitive pricing through our transparent bidding system.",
    icon: DollarSign,
  },
  {
    title: "Book Exchange",
    description: "Trade books directly with other users with detailed book information.",
    icon: Repeat,
  },
  {
    title: "External Chat System",
    description: "Communicate with sellers or buyers via WhatsApp.",
    icon: MessageSquare,
  },
  {
    title: "User-Friendly",
    description: "Enjoy our simple and clean user interface designed for book lovers.",
    icon: Layout,
  },
];
