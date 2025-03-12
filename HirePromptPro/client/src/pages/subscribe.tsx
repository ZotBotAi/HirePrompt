import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PRICING_PLANS } from '@/lib/stripe';
import { Loader, CheckCircle } from 'lucide-react';

// Main subscribe page
export default function Subscribe() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, updateUser } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("PROFESSIONAL");
  const [isLoading, setIsLoading] = useState(false);
  const [planUpdated, setPlanUpdated] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle plan selection
  const handleSelectPlan = async (planKey: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const planValue = planKey.toLowerCase();
      
      await apiRequest("POST", "/api/update-plan", { 
        userId: user.id,
        plan: planValue
      });
      
      updateUser({ plan: planValue });
      setPlanUpdated(true);
      
      toast({
        title: "Plan Updated",
        description: `You are now using the ${PRICING_PLANS[planKey as keyof typeof PRICING_PLANS].name} plan.`,
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Update Error",
        description: error instanceof Error ? error.message : "Failed to update plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Check if user is already on the selected plan
  const isCurrentPlan = (planKey: string) => user.plan === planKey.toLowerCase();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription Plans</h1>
            <p className="mt-2 text-lg text-gray-500">
              Choose the plan that works best for you
            </p>
          </header>
          
          {planUpdated ? (
            <Card className="text-center py-10">
              <CardContent>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Plan Updated Successfully!</h2>
                <p className="mt-2 text-gray-600">
                  Your plan has been updated to {PRICING_PLANS[selectedPlan as keyof typeof PRICING_PLANS].name}.
                  You now have access to all the features.
                </p>
                <Button 
                  className="mt-6" 
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Plan Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {Object.entries(PRICING_PLANS).map(([planKey, plan]) => (
                  <Card 
                    key={planKey} 
                    className={`relative overflow-hidden ${
                      isCurrentPlan(planKey) ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 right-0 -mr-2 -mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Recommended
                        </span>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        ${plan.price}/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant={plan.buttonVariant}
                        className="w-full"
                        onClick={() => handleSelectPlan(planKey)}
                        disabled={isCurrentPlan(planKey) || isLoading}
                      >
                        {isLoading && selectedPlan === planKey ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : isCurrentPlan(planKey) ? (
                          'Current Plan'
                        ) : (
                          plan.buttonText
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
