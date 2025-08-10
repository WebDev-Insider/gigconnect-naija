import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Palette, 
  MapPin, 
  GraduationCap, 
  Smartphone, 
  Camera,
  Code,
  MessageSquare 
} from "lucide-react";

const categories = [
  {
    icon: FileText,
    title: "Typing & Documents",
    description: "Data entry, transcription, document formatting, CV writing",
    color: "text-blue-600"
  },
  {
    icon: Palette,
    title: "Graphics & Design",
    description: "Logo design, flyers, business cards, social media graphics",
    color: "text-purple-600"
  },
  {
    icon: MapPin,
    title: "Errands & Tasks",
    description: "Shopping, delivery, queue services, local assistance",
    color: "text-green-600"
  },
  {
    icon: GraduationCap,
    title: "Academic Help",
    description: "Research, assignments, tutoring, proofreading",
    color: "text-orange-600"
  },
  {
    icon: Smartphone,
    title: "Digital Services",
    description: "Social media management, data collection, online research",
    color: "text-pink-600"
  },
  {
    icon: Camera,
    title: "Media & Content",
    description: "Video editing, photography, content writing, voice-over",
    color: "text-red-600"
  },
  {
    icon: Code,
    title: "Tech Support",
    description: "Basic web development, app testing, tech tutorials",
    color: "text-indigo-600"
  },
  {
    icon: MessageSquare,
    title: "Customer Service",
    description: "Virtual assistance, chat support, call handling",
    color: "text-teal-600"
  }
];

const Categories = () => {
  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Service Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From quick typing tasks to creative designs, find the right freelancer for any job
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card 
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-gradient-card border-border/50 cursor-pointer"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-subtle rounded-full flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                  <category.icon className={`h-8 w-8 ${category.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Post a custom job request!
          </p>
          <button className="text-primary hover:text-primary-hover font-semibold hover:underline transition-colors">
            Browse All Categories →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;