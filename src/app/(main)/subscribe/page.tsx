"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import Navbar from "@/components/layout/Navbar";
import { styled } from "@mui/material/styles";
import Grid from '@mui/material/Grid';
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function SubscribePage() {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Explorer",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "3 AI summaries/day",
        "Basic personas (ZenGPT)",
        "Community access",
        "Weekly challenges",
        "Gen-Z content curation",
        "Basic analytics",
      ],
      cta: "Current Plan",
      theme: "from-gray-600 to-gray-700",
      popular: false,
    },
    {
      id: "premium",
      name: "AI Oracle",
      price: "$9.99",
      description: "Unlock your full potential",
      features: [
        "Unlimited AI summaries",
        "All personas + custom training",
        "Exclusive research reports",
        "Priority support",
        "Advanced analytics",
        "Early access features",
        "Custom content feeds",
        "Discord VIP access",
      ],
      cta: "Start Free Trial",
      theme: "from-purple-600 to-pink-600",
      popular: true,
    },
  ];

  const handleSubscribe = async () => {
    if (selectedPlan === "free") return;

    setLoading(true);
    try {
      const response = await fetch("/api/v1/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: `${window.location.origin}/subscribe`,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="pt-20 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Social Proof */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            >
              Join 50k+ AI Enthusiasts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg"
            >
              Premium users are 3x more informed about AI trends
            </motion.p>
          </div>

          {/* Plan Comparison */}
          <Box sx={{ width: "100%" }} className="mb-12">
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              {plans.map((plan, index) => (
                <Grid key={plan.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' } }}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      relative rounded-2xl p-8 cursor-pointer transition-all border-2
                      ${selectedPlan === plan.id ? "border-purple-500" : "border-transparent"}
                      bg-gradient-to-br ${plan.theme}
                    `}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          🔥 Most Popular
                        </span>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-3xl font-bold text-white mb-2">
                      {plan.price}
                      {plan.id !== "free" && (
                        <span className="text-lg text-gray-300">/month</span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-6">{plan.description}</p>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-white">
                          <span className="text-green-400 mr-3">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubscribe}
                      disabled={plan.id === "free" || loading}
                      className={`
                        w-full py-3 rounded-lg font-bold transition-all
                        ${
                          plan.id === "free"
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-white text-purple-600 hover:bg-gray-100"
                        }
                      `}
                    >
                      {loading ? "Processing..." : plan.cta}
                    </motion.button>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Features Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-2xl p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              ✨ What Makes Premium Worth It?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "🤖",
                  title: "Unlimited AI Power",
                  description:
                    "Generate as many AI summaries as you want with all persona types",
                },
                {
                  icon: "📊",
                  title: "Advanced Analytics",
                  description:
                    "Track your learning patterns and get personalized insights",
                },
                {
                  icon: "🎯",
                  title: "Custom Content",
                  description:
                    "Create personalized feeds based on your interests and goals",
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Conversion Incentives */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-2xl p-8 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              🎯 Limited Time Offer
            </h3>
            <p className="text-gray-400 mb-6">
              Students get 50% off • Use code:{" "}
              <span className="text-purple-400 font-bold">STUDENT50</span>
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                30-day free trial
              </span>
              <span className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Cancel anytime
              </span>
              <span className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                No hidden fees
              </span>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <h3 className="text-xl font-bold text-white text-center mb-8">
              💬 What Gen-Z Users Say
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Alex Chen",
                  role: "CS Student",
                  content:
                    "Everhood keeps me ahead of AI trends. The persona feature is genius!",
                  avatar: "🦄",
                },
                {
                  name: "Sam Rivera",
                  role: "Startup Founder",
                  content:
                    "HustleBot mode gives me the energy and insights I need for my startup.",
                  avatar: "🚀",
                },
                {
                  name: "Jordan Kim",
                  role: "Tech Influencer",
                  content:
                    "DataDaddy persona helps me create data-driven content that hits different.",
                  avatar: "⚡",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <div className="font-semibold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
