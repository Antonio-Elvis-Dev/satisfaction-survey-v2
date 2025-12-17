import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, TrendingUp, Users, CheckCircle, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <FileText className="w-10 h-10 text-primary" />,
      title: "Criação Simplificada",
      description: "Crie pesquisas personalizadas com múltiplos tipos de perguntas em minutos"
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-primary" />,
      title: "Análises em Tempo Real",
      description: "Acompanhe métricas como NPS, CSAT e respostas abertas instantaneamente"
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-primary" />,
      title: "Insights Acionáveis",
      description: "Transforme dados em decisões estratégicas com relatórios detalhados"
    },
    {
      icon: <Users className="w-10 h-10 text-primary" />,
      title: "Gestão de Respondentes",
      description: "Controle completo sobre quem pode acessar e responder suas pesquisas"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center space-y-8 max-w-4xl">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            ✨ Transforme Feedback em Resultados
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Sistema de Pesquisas
            <span className="block text-primary">Inteligente e Completo</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Crie, distribua e analise pesquisas profissionais com facilidade. 
            Obtenha insights valiosos para tomar decisões estratégicas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {user ? (
              <Button size="lg" onClick={() => navigate("/dashboard")} className="text-lg px-8">
                <Zap className="w-5 h-5 mr-2" />
                Ir para Dashboard
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate("/login")} className="text-lg px-8">
                Começar Agora
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-muted-foreground">
              Ferramentas poderosas para criar pesquisas que realmente geram resultados
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Por que escolher nossa plataforma?
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              "Interface intuitiva e fácil de usar",
              "Múltiplos tipos de perguntas (texto, múltipla escolha, rating, NPS)",
              "Análises automáticas de NPS e CSAT",
              "Respostas em tempo real",
              "Sistema seguro com autenticação",
              "Visualizações e relatórios profissionais"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Card className="border-2 border-primary">
            <CardHeader className="space-y-4 pb-8">
              <CardTitle className="text-3xl">
                Pronto para começar?
              </CardTitle>
              <CardDescription className="text-lg">
                Crie sua primeira pesquisa em minutos e comece a coletar feedback valioso
              </CardDescription>
              <Button 
                size="lg" 
                onClick={() => navigate(user ? "/create" : "/login")}
                className="text-lg px-8"
              >
                {user ? "Criar Pesquisa" : "Começar Agora"}
              </Button>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
