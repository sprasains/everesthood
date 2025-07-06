import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

export default function PricingPage() {
  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      per: "month",
      description: "Perfect for trying out EverestHood and basic agent usage.",
      features: [
        "100 Agent Executions/month",
        "Basic Dashboard Access",
        "Community Support",
        "Limited Data Retention",
      ],
      buttonText: "Start for Free",
      buttonVariant: "outline",
    },
    {
      name: "Starter",
      price: "$29",
      per: "month",
      description: "Ideal for individuals needing more agent power.",
      features: [
        "1,000 Agent Executions/month",
        "Advanced Dashboard Features",
        "Email Support",
        "30-day Data Retention",
        "Access to Premium Agent Templates",
      ],
      buttonText: "Get Started",
      buttonVariant: "default",
    },
    {
      name: "Pro",
      price: "$99",
      per: "month",
      description: "For power users and small teams with high demands.",
      features: [
        "10,000 Agent Executions/month",
        "All Starter Features",
        "Priority Support",
        "90-day Data Retention",
        "Custom Agent Creation (Beta)",
        "Dedicated Account Manager",
      ],
      buttonText: "Go Pro",
      buttonVariant: "default",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Flexible Pricing for Every Need
          </h1>
          <p className="mt-5 text-xl text-gray-500">
            Choose the plan that best fits your agent execution needs.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white"
            >
              <div className="p-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">
                  {tier.name}
                </h2>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /{tier.per}
                  </span>
                </p>
                <p className="mt-3 text-base text-gray-500">
                  {tier.description}
                </p>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <CheckIcon
                        className="flex-shrink-0 h-5 w-5 text-green-500"
                        aria-hidden="true"
                      />
                      <span className="text-base text-gray-500">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6">
                <Button className="w-full" variant={tier.buttonVariant as "default" | "outline"}>
                  {tier.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
