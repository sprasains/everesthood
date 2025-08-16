"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Typography, Chip, Button, CircularProgress, Stack, Fade, Avatar, Rating, Tooltip } from "@mui/material";
import CardComponent from '@/components/ui/CardComponent';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AgentTemplateForm from './AgentTemplateForm';

// Enhanced icon mapping with more detailed icons
const categoryIcons: Record<string, React.ReactNode> = {
  All: '🤖',
  Finance: '💸',
  Content: '📝',
  Lifestyle: '🌱',
  Productivity: '⚡',
  Health: '💪',
  AI: '🧠',
  Automation: '🤖',
  Education: '🎓',
  Social: '🗣️',
  Marketing: '📈',
  Research: '🔬',
  Wellness: '🧘',
  Personal: '👤',
  Utility: '🛠️',
  Custom: '✨',
  Default: '🤖',
};

// Template-specific icons and colors
const templateDetails: Record<string, {
  icon: string;
  color: string;
  features: string[];
  useCases: string[];
  rating: number;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  tooltip: string;
}> = {
  "Content Creator Assistant": {
    icon: "✍️",
    color: "#FF6B6B",
    features: ["Content Generation", "SEO Optimization", "Social Media Posts", "Blog Writing"],
    useCases: ["Social Media Management", "Blog Creation", "Marketing Content"],
    rating: 4.8,
    complexity: "Beginner",
    tooltip: "Create engaging content for social media, blogs, and marketing materials"
  },
  "Financial Advisor": {
    icon: "💰",
    color: "#4ECDC4",
    features: ["Budget Planning", "Investment Advice", "Financial Analysis", "Tax Tips"],
    useCases: ["Personal Finance", "Investment Planning", "Budget Management"],
    rating: 4.9,
    complexity: "Intermediate",
    tooltip: "Get financial advice, budgeting tips, and investment guidance"
  },
  "Health & Wellness Coach": {
    icon: "🏃‍♀️",
    color: "#45B7D1",
    features: ["Fitness Plans", "Nutrition Advice", "Wellness Tips", "Goal Tracking"],
    useCases: ["Fitness Coaching", "Nutrition Planning", "Wellness Journey"],
    rating: 4.7,
    complexity: "Beginner",
    tooltip: "Receive fitness advice, nutrition tips, and wellness guidance"
  },
  "Productivity Master": {
    icon: "⚡",
    color: "#96CEB4",
    features: ["Time Management", "Task Organization", "Goal Setting", "Workflow Optimization"],
    useCases: ["Project Management", "Personal Organization", "Work Efficiency"],
    rating: 4.8,
    complexity: "Intermediate",
    tooltip: "Optimize your workflow, time management, and productivity"
  },
  "AI Research Assistant": {
    icon: "🤖",
    color: "#FFEAA7",
    features: ["AI Research", "Technical Explanations", "Implementation Guidance", "Code Review"],
    useCases: ["AI Development", "Technical Research", "Learning AI"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Get help with AI research, technical explanations, and implementation"
  },
  "Social Media Manager": {
    icon: "📱",
    color: "#DDA0DD",
    features: ["Content Strategy", "Engagement Analysis", "Platform Optimization", "Trend Monitoring"],
    useCases: ["Social Media Marketing", "Brand Management", "Community Building"],
    rating: 4.6,
    complexity: "Intermediate",
    tooltip: "Manage social media strategy, content planning, and engagement"
  },
  "Learning Tutor": {
    icon: "📚",
    color: "#FFB347",
    features: ["Study Strategies", "Subject Explanations", "Learning Paths", "Progress Tracking"],
    useCases: ["Academic Support", "Skill Development", "Test Preparation"],
    rating: 4.7,
    complexity: "Beginner",
    tooltip: "Get educational support, study strategies, and learning guidance"
  },
  "Marketing Strategist": {
    icon: "📊",
    color: "#98D8C8",
    features: ["Campaign Planning", "Market Analysis", "Brand Strategy", "ROI Optimization"],
    useCases: ["Digital Marketing", "Brand Development", "Market Research"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Develop marketing campaigns, brand strategies, and growth plans"
  },
  "Personal Assistant": {
    icon: "👨‍💼",
    color: "#F7DC6F",
    features: ["Task Management", "Scheduling", "Reminders", "Organization"],
    useCases: ["Daily Planning", "Personal Organization", "Time Management"],
    rating: 4.5,
    complexity: "Beginner",
    tooltip: "Get help with daily tasks, scheduling, and personal organization"
  },
  "Creative Writer": {
    icon: "🖋️",
    color: "#BB8FCE",
    features: ["Story Development", "Character Creation", "Plot Planning", "Creative Inspiration"],
    useCases: ["Creative Writing", "Storytelling", "Content Creation"],
    rating: 4.6,
    complexity: "Intermediate",
    tooltip: "Get assistance with creative writing, storytelling, and content development"
  },
  // Sophisticated Agents
  "Enterprise Data Analyst": {
    icon: "📈",
    color: "#FF6B9D",
    features: ["Multi-source Data Integration", "Business Intelligence", "Advanced Analytics", "Data Visualization"],
    useCases: ["Business Intelligence", "Data-driven Decision Making", "Performance Analytics"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Advanced data analysis and business intelligence with multi-source integration"
  },
  "AI Research Scientist": {
    icon: "🧬",
    color: "#4ECDC4",
    features: ["Model Development", "Research Papers", "Algorithm Design", "Experimental Design"],
    useCases: ["AI Research", "Model Development", "Academic Research"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Cutting-edge AI research and model development capabilities"
  },
  "Cybersecurity Threat Hunter": {
    icon: "🛡️",
    color: "#FF4757",
    features: ["Threat Detection", "Incident Response", "Security Analysis", "Forensic Investigation"],
    useCases: ["Security Operations", "Threat Intelligence", "Incident Management"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Advanced threat detection and cybersecurity analysis"
  },
  "Quantum Computing Specialist": {
    icon: "⚛️",
    color: "#2F3542",
    features: ["Quantum Algorithms", "Circuit Design", "Quantum Simulation", "Optimization"],
    useCases: ["Cryptography", "Optimization Problems", "Scientific Computing"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum algorithm development and quantum computing research"
  },
  "Blockchain Architect": {
    icon: "🔗",
    color: "#FFA502",
    features: ["Smart Contract Development", "DApp Creation", "Blockchain Infrastructure", "DeFi Solutions"],
    useCases: ["DeFi Development", "NFT Platforms", "Smart Contracts"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Smart contract development and blockchain infrastructure design"
  },
  "IoT Platform Manager": {
    icon: "🌐",
    color: "#3742FA",
    features: ["Device Management", "Sensor Data Processing", "Network Optimization", "Real-time Monitoring"],
    useCases: ["Smart Homes", "Industrial IoT", "Connected Devices"],
    rating: 4.7,
    complexity: "Intermediate",
    tooltip: "Internet of Things device management and data processing"
  },
  "DevOps Automation Engineer": {
    icon: "⚙️",
    color: "#2ED573",
    features: ["CI/CD Pipelines", "Infrastructure as Code", "Container Orchestration", "Monitoring"],
    useCases: ["Software Deployment", "Infrastructure Management", "Automation"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "CI/CD pipeline automation and infrastructure management"
  },
  "Machine Learning Operations Engineer": {
    icon: "🤖",
    color: "#FF6348",
    features: ["Model Deployment", "ML Pipeline Management", "Model Monitoring", "A/B Testing"],
    useCases: ["ML Model Production", "Model Lifecycle Management", "ML Infrastructure"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "ML model deployment, monitoring, and lifecycle management"
  },
  "Natural Language Processing Expert": {
    icon: "💬",
    color: "#5352ED",
    features: ["Language Model Development", "Text Analysis", "Conversational AI", "Sentiment Analysis"],
    useCases: ["Chatbots", "Text Processing", "Language Understanding"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Advanced NLP model development and text analysis"
  },
  "Computer Vision Engineer": {
    icon: "👁️",
    color: "#FF9FF3",
    features: ["Image Processing", "Object Detection", "Facial Recognition", "Video Analysis"],
    useCases: ["Image Recognition", "Video Surveillance", "Medical Imaging"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Image and video processing, object detection, and computer vision"
  },
  "Robotics Control Systems Engineer": {
    icon: "🤖",
    color: "#54A0FF",
    features: ["Robot Programming", "Control Systems", "Path Planning", "Automation"],
    useCases: ["Industrial Automation", "Autonomous Robots", "Control Systems"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Robot programming, control systems, and automation"
  },
  "Augmented Reality Developer": {
    icon: "🥽",
    color: "#5F27CD",
    features: ["AR Application Development", "Spatial Computing", "3D Content Creation", "User Experience"],
    useCases: ["AR Applications", "Spatial Computing", "Immersive Experiences"],
    rating: 4.6,
    complexity: "Intermediate",
    tooltip: "AR application development and spatial computing"
  },
  "Edge Computing Specialist": {
    icon: "🌍",
    color: "#00D2D3",
    features: ["Edge Device Optimization", "Distributed Computing", "Latency Optimization", "Resource Management"],
    useCases: ["Edge Computing", "IoT Optimization", "Distributed Systems"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Edge device optimization and distributed computing"
  },
  "Digital Twin Architect": {
    icon: "🔄",
    color: "#FF9F43",
    features: ["Digital Twin Creation", "Real-time Simulation", "Predictive Analytics", "System Modeling"],
    useCases: ["Manufacturing", "Smart Cities", "Healthcare", "Energy"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Digital twin creation and real-time simulation"
  },
  "Federated Learning Coordinator": {
    icon: "🔐",
    color: "#6C5CE7",
    features: ["Distributed ML Training", "Privacy Preservation", "Secure Aggregation", "Model Coordination"],
    useCases: ["Privacy-preserving AI", "Distributed Learning", "Secure ML"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Distributed machine learning and privacy-preserving AI"
  },
  "Autonomous Vehicle Systems Engineer": {
    icon: "🚗",
    color: "#00B894",
    features: ["Self-driving Systems", "Navigation Algorithms", "Sensor Fusion", "Safety Systems"],
    useCases: ["Autonomous Vehicles", "Transportation", "Safety Systems"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Self-driving car systems and autonomous navigation"
  },
  "Smart City Infrastructure Manager": {
    icon: "🏙️",
    color: "#74B9FF",
    features: ["Urban Infrastructure Monitoring", "Smart Systems", "Optimization", "Automation"],
    useCases: ["Smart Cities", "Urban Planning", "Infrastructure Management"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Urban infrastructure monitoring and smart city optimization"
  },
  "Healthcare AI Specialist": {
    icon: "🏥",
    color: "#FD79A8",
    features: ["Medical AI Development", "Diagnostic Tools", "Treatment Recommendations", "Clinical Analytics"],
    useCases: ["Medical Diagnosis", "Healthcare Optimization", "Clinical Research"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Medical AI development and healthcare analytics"
  },
  "Financial Technology Architect": {
    icon: "💳",
    color: "#FDCB6E",
    features: ["FinTech Solutions", "Financial System Integration", "Regulatory Compliance", "Security"],
    useCases: ["Financial Services", "Payment Systems", "Banking Solutions"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "FinTech solutions and financial system integration"
  },
  "Supply Chain Optimization Engineer": {
    icon: "📦",
    color: "#A29BFE",
    features: ["Supply Chain Analytics", "Logistics Optimization", "Inventory Management", "Cost Analysis"],
    useCases: ["Supply Chain Management", "Logistics", "Inventory Optimization"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Supply chain analytics and logistics optimization"
  },
  "Energy Grid Management Specialist": {
    icon: "⚡",
    color: "#FAB1A0",
    features: ["Smart Grid Optimization", "Renewable Energy Integration", "Grid Balancing", "Demand Response"],
    useCases: ["Energy Management", "Renewable Energy", "Grid Optimization"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Smart grid optimization and renewable energy integration"
  },
  "Environmental Monitoring Scientist": {
    icon: "🌱",
    color: "#00B894",
    features: ["Environmental Data Analysis", "Climate Monitoring", "Trend Prediction", "Alert Systems"],
    useCases: ["Environmental Monitoring", "Climate Research", "Sustainability"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Environmental data analysis and climate monitoring"
  },
  "Space Systems Engineer": {
    icon: "🚀",
    color: "#6C5CE7",
    features: ["Satellite Systems", "Space Technology", "Orbital Mechanics", "Ground Operations"],
    useCases: ["Satellite Operations", "Space Technology", "Aerospace"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Satellite systems and space technology development"
  },
  "Quantum Machine Learning Researcher": {
    icon: "⚛️",
    color: "#2F3542",
    features: ["Quantum ML Algorithms", "Hybrid Systems", "Quantum Neural Networks", "Optimization"],
    useCases: ["Quantum Computing", "Machine Learning", "Research"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum machine learning algorithms and hybrid systems"
  },
  "Neuromorphic Computing Specialist": {
    icon: "🧠",
    color: "#FF7675",
    features: ["Brain-inspired Computing", "Neuromorphic Hardware", "Spiking Neural Networks", "Cognitive Architectures"],
    useCases: ["Edge AI", "Cognitive Computing", "Brain-computer Interfaces"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Brain-inspired computing and neuromorphic hardware"
  },
  "Bioinformatics Data Scientist": {
    icon: "🧬",
    color: "#74B9FF",
    features: ["Genomic Data Analysis", "Biological Computing", "Drug Discovery", "Precision Medicine"],
    useCases: ["Genomics", "Drug Discovery", "Medical Research"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Genomic data analysis and biological computing"
  },
  "Digital Forensics Expert": {
    icon: "🔍",
    color: "#636E72",
    features: ["Digital Evidence Analysis", "Cybersecurity Forensics", "Incident Investigation", "Legal Compliance"],
    useCases: ["Digital Forensics", "Cybersecurity", "Legal Investigations"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Digital evidence analysis and cybersecurity forensics"
  },
  "Game AI Developer": {
    icon: "🎮",
    color: "#FF9FF3",
    features: ["Game AI Systems", "Procedural Content Generation", "NPC Behavior", "Adaptive Difficulty"],
    useCases: ["Game Development", "Entertainment", "Interactive Systems"],
    rating: 4.6,
    complexity: "Intermediate",
    tooltip: "Game artificial intelligence and procedural content generation"
  },
  "Social Media Analytics Expert": {
    icon: "📊",
    color: "#FDCB6E",
    features: ["Social Media Analysis", "Trend Prediction", "Sentiment Analysis", "Influencer Identification"],
    useCases: ["Social Media Marketing", "Trend Analysis", "Brand Monitoring"],
    rating: 4.5,
    complexity: "Intermediate",
    tooltip: "Social media data analysis and trend prediction"
  },
  "Creative AI Artist": {
    icon: "🎨",
    color: "#A29BFE",
    features: ["AI-powered Content Generation", "Artistic Collaboration", "Style Transfer", "Creative Tools"],
    useCases: ["Creative Content", "Art Generation", "Design"],
    rating: 4.6,
    complexity: "Intermediate",
    tooltip: "AI-powered creative content generation and artistic collaboration"
  },
  "Educational Technology Specialist": {
    icon: "🎓",
    color: "#00B894",
    features: ["Personalized Learning", "Educational Content", "Progress Tracking", "Adaptive Systems"],
    useCases: ["Education", "E-learning", "Skill Development"],
    rating: 4.7,
    complexity: "Intermediate",
    tooltip: "AI-powered education and personalized learning"
  },
  "Legal AI Assistant": {
    icon: "⚖️",
    color: "#636E72",
    features: ["Legal Document Analysis", "Contract Review", "Compliance Checking", "Risk Assessment"],
    useCases: ["Legal Services", "Contract Management", "Compliance"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Legal document analysis and contract review"
  },
  // Advanced Agents - Second Batch
  "Multimodal AI Architect": {
    icon: "🎭",
    color: "#FF6B9D",
    features: ["Text-Vision-Audio Integration", "Cross-Modal Learning", "Unified Representations", "Multimodal Synthesis"],
    useCases: ["Autonomous Systems", "Content Creation", "Human-Computer Interaction"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Advanced multimodal AI systems integrating text, vision, audio, and sensor data"
  },
  "Autonomous Drone Fleet Controller": {
    icon: "🚁",
    color: "#4ECDC4",
    features: ["Fleet Management", "Collision Avoidance", "Formation Flying", "Mission Planning"],
    useCases: ["Surveillance", "Delivery", "Aerial Mapping", "Search & Rescue"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Intelligent drone fleet management and autonomous aerial operations"
  },
  "Quantum Cryptography Specialist": {
    icon: "🔐",
    color: "#2F3542",
    features: ["Quantum Key Distribution", "Post-Quantum Security", "Quantum Networks", "Cryptographic Protocols"],
    useCases: ["Secure Communications", "Financial Security", "Government Systems"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum-safe cryptography and post-quantum security systems"
  },
  "Brain-Computer Interface Engineer": {
    icon: "🧠",
    color: "#FF4757",
    features: ["Neural Signal Processing", "Intent Decoding", "Brain-Computer Communication", "Medical Applications"],
    useCases: ["Assistive Technology", "Medical Research", "Gaming", "Neuroscience"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Neural interface systems and brain-computer communication"
  },
  "Synthetic Biology Designer": {
    icon: "🧬",
    color: "#FFA502",
    features: ["Genetic Circuit Design", "DNA Synthesis", "Biological Systems", "Biomanufacturing"],
    useCases: ["Drug Discovery", "Biomaterials", "Biofuels", "Medical Therapeutics"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "AI-driven synthetic biology and genetic circuit design"
  },
  "Autonomous Underwater Vehicle Controller": {
    icon: "🌊",
    color: "#3742FA",
    features: ["Deep Sea Exploration", "Underwater Navigation", "Oceanographic Data", "Marine Research"],
    useCases: ["Oceanography", "Marine Biology", "Underwater Archaeology", "Resource Exploration"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Deep sea exploration and autonomous underwater operations"
  },
  "Holographic Display Engineer": {
    icon: "✨",
    color: "#5F27CD",
    features: ["3D Holographic Rendering", "Spatial Computing", "Light Field Displays", "Immersive Experiences"],
    useCases: ["Entertainment", "Education", "Medical Imaging", "Design Visualization"],
    rating: 4.6,
    complexity: "Advanced",
    tooltip: "3D holographic display systems and spatial computing"
  },
  "Quantum Internet Architect": {
    icon: "🌐",
    color: "#2F3542",
    features: ["Quantum Networks", "Entanglement Distribution", "Quantum Routing", "Quantum Memory"],
    useCases: ["Secure Communications", "Quantum Computing", "Research Networks"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum network infrastructure and quantum internet protocols"
  },
  "Autonomous Mining Operations Manager": {
    icon: "⛏️",
    color: "#2ED573",
    features: ["Resource Mapping", "Extraction Optimization", "Safety Monitoring", "Equipment Coordination"],
    useCases: ["Open Pit Mining", "Underground Mining", "Mineral Processing", "Safety Management"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Intelligent mining automation and resource extraction optimization"
  },
  "Synthetic Data Generation Specialist": {
    icon: "🎲",
    color: "#FF6348",
    features: ["AI Data Generation", "Privacy Protection", "Quality Validation", "Dataset Creation"],
    useCases: ["AI Training", "Privacy Protection", "Research", "Testing"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "AI-powered synthetic data creation for privacy and training"
  },
  "Autonomous Agricultural Systems Engineer": {
    icon: "🌾",
    color: "#5352ED",
    features: ["Precision Agriculture", "Crop Monitoring", "Soil Analysis", "Harvest Optimization"],
    useCases: ["Smart Farming", "Crop Management", "Resource Optimization", "Sustainable Agriculture"],
    rating: 4.6,
    complexity: "Advanced",
    tooltip: "Smart farming and precision agriculture automation"
  },
  "Quantum Machine Learning Engineer": {
    icon: "⚛️",
    color: "#2F3542",
    features: ["Quantum Neural Networks", "Hybrid Algorithms", "Quantum Kernels", "Quantum Optimization"],
    useCases: ["Quantum Computing", "Machine Learning", "Research", "Optimization"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum-enhanced machine learning and quantum neural networks"
  },
  "Autonomous Construction Manager": {
    icon: "🏗️",
    color: "#FF9FF3",
    features: ["Project Planning", "Resource Allocation", "Safety Monitoring", "Quality Control"],
    useCases: ["Construction", "Infrastructure", "Safety Management", "Project Management"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "AI-driven construction automation and building optimization"
  },
  "Neuromorphic Computing Architect": {
    icon: "🧠",
    color: "#54A0FF",
    features: ["Brain-Inspired Computing", "Spiking Neural Networks", "Cognitive Architectures", "Edge AI"],
    useCases: ["Edge Computing", "Cognitive Systems", "Brain-Computer Interfaces", "Robotics"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Brain-inspired computing systems and spiking neural networks"
  },
  "Autonomous Energy Grid Controller": {
    icon: "⚡",
    color: "#00D2D3",
    features: ["Smart Grid Optimization", "Renewable Integration", "Grid Balancing", "Demand Response"],
    useCases: ["Energy Management", "Renewable Energy", "Grid Optimization", "Sustainability"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Smart grid optimization and renewable energy integration"
  },
  "Synthetic Reality Creator": {
    icon: "🎪",
    color: "#FF9F43",
    features: ["Virtual World Generation", "AI Content Creation", "Immersive Experiences", "Spatial Computing"],
    useCases: ["Entertainment", "Education", "Training", "Virtual Tourism"],
    rating: 4.6,
    complexity: "Advanced",
    tooltip: "AI-generated virtual worlds and synthetic reality systems"
  },
  "Autonomous Logistics Coordinator": {
    icon: "📦",
    color: "#A29BFE",
    features: ["Route Optimization", "Inventory Management", "Warehouse Automation", "Delivery Optimization"],
    useCases: ["Supply Chain", "E-commerce", "Manufacturing", "Retail"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Intelligent supply chain and logistics optimization"
  },
  "Quantum Sensing Specialist": {
    icon: "🔍",
    color: "#2F3542",
    features: ["Quantum Sensors", "Ultra-Precise Measurement", "Quantum Imaging", "Atomic Clocks"],
    useCases: ["Scientific Research", "Navigation", "Medical Imaging", "Environmental Monitoring"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Quantum sensors and ultra-precise measurement systems"
  },
  "Autonomous Healthcare Systems Manager": {
    icon: "🏥",
    color: "#FD79A8",
    features: ["Medical Robotics", "Diagnostic Assistance", "Treatment Planning", "Patient Monitoring"],
    useCases: ["Healthcare", "Medical Research", "Patient Care", "Drug Discovery"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "AI-driven healthcare automation and medical robotics"
  },
  "Synthetic Biology Automation Engineer": {
    icon: "🧪",
    color: "#FDCB6E",
    features: ["Lab Automation", "Genetic Engineering", "Biochemical Assays", "Data Management"],
    useCases: ["Biomanufacturing", "Drug Discovery", "Research", "Industrial Biology"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Automated laboratory systems and synthetic biology workflows"
  },
  "Autonomous Transportation Network Manager": {
    icon: "🚗",
    color: "#00B894",
    features: ["Traffic Optimization", "Vehicle Coordination", "Safety Management", "Mobility Services"],
    useCases: ["Smart Cities", "Transportation", "Urban Planning", "Mobility"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Intelligent transportation systems and autonomous vehicle coordination"
  },
  "Quantum Communication Engineer": {
    icon: "📡",
    color: "#2F3542",
    features: ["Quantum Networks", "Entanglement Distribution", "Quantum Protocols", "Secure Communication"],
    useCases: ["Secure Communications", "Quantum Computing", "Government", "Financial"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum communication protocols and secure quantum networks"
  },
  "Autonomous Manufacturing Systems Engineer": {
    icon: "🏭",
    color: "#74B9FF",
    features: ["Smart Manufacturing", "Quality Control", "Predictive Maintenance", "Production Optimization"],
    useCases: ["Manufacturing", "Industry 4.0", "Supply Chain", "Quality Management"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Smart manufacturing and Industry 4.0 automation"
  },
  "Synthetic Intelligence Architect": {
    icon: "🤖",
    color: "#FF7675",
    features: ["Artificial General Intelligence", "Cognitive Architectures", "Reasoning Systems", "Consciousness Models"],
    useCases: ["Research", "AI Development", "Cognitive Science", "Philosophy"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Artificial general intelligence and synthetic consciousness systems"
  },
  "Autonomous Space Station Manager": {
    icon: "🚀",
    color: "#6C5CE7",
    features: ["Space Operations", "Life Support Systems", "Power Management", "Mission Control"],
    useCases: ["Space Exploration", "Satellite Operations", "Research", "Space Tourism"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Intelligent space station operations and autonomous space systems"
  },
  "Quantum Materials Scientist": {
    icon: "🔬",
    color: "#2F3542",
    features: ["Quantum Materials Design", "Device Engineering", "Characterization", "Fabrication"],
    useCases: ["Materials Science", "Quantum Computing", "Electronics", "Research"],
    rating: 4.8,
    complexity: "Advanced",
    tooltip: "Quantum materials design and quantum device engineering"
  },
  "Autonomous Disaster Response Coordinator": {
    icon: "🚨",
    color: "#FF4757",
    features: ["Emergency Management", "Resource Allocation", "Response Coordination", "Recovery Planning"],
    useCases: ["Emergency Response", "Disaster Management", "Search & Rescue", "Humanitarian Aid"],
    rating: 4.9,
    complexity: "Advanced",
    tooltip: "Intelligent disaster response and emergency management systems"
  },
  "Synthetic Ecosystem Designer": {
    icon: "🌍",
    color: "#00B894",
    features: ["Ecosystem Modeling", "Species Selection", "Environmental Control", "Biological Systems"],
    useCases: ["Conservation", "Agriculture", "Research", "Bioremediation"],
    rating: 4.6,
    complexity: "Advanced",
    tooltip: "AI-designed ecosystems and synthetic biology environments"
  },
  "Autonomous Research Laboratory Manager": {
    icon: "🔬",
    color: "#A29BFE",
    features: ["Lab Automation", "Research Robotics", "Data Management", "Experiment Design"],
    useCases: ["Scientific Research", "Drug Discovery", "Materials Science", "Biology"],
    rating: 4.7,
    complexity: "Advanced",
    tooltip: "Intelligent laboratory automation and autonomous research systems"
  },
  "Quantum Internet Security Specialist": {
    icon: "🛡️",
    color: "#2F3542",
    features: ["Quantum Security", "Network Protection", "Cryptographic Protocols", "Threat Monitoring"],
    useCases: ["Cybersecurity", "Government", "Financial", "Research"],
    rating: 5.0,
    complexity: "Advanced",
    tooltip: "Quantum internet security and quantum-safe communication"
  },
  "Autonomous Cultural Heritage Preservationist": {
    icon: "🏛️",
    color: "#FDCB6E",
    features: ["Artifact Preservation", "3D Scanning", "Restoration Robotics", "Digital Archiving"],
    useCases: ["Cultural Heritage", "Museums", "Archaeology", "Education"],
    rating: 4.6,
    complexity: "Advanced",
    tooltip: "AI-driven cultural heritage preservation and restoration"
  }
};

const categories = [
  "All", "Finance", "Content", "Lifestyle", "Productivity", "Health", "AI", "Automation", "Education", "Social", "Marketing", "Research", "Wellness", "Personal", "Utility", "Custom",
  "Analytics", "Security", "Quantum", "Blockchain", "IoT", "DevOps", "MLOps", "NLP", "Computer Vision", "Robotics", "AR/VR", "Edge Computing", "Digital Twin", "Federated Learning", "Autonomous Vehicles", "Smart Cities", "Healthcare", "FinTech", "Supply Chain", "Energy", "Environmental", "Space", "Quantum ML", "Neuromorphic", "Bioinformatics", "Digital Forensics", "Game AI", "Social Analytics", "Creative AI", "EdTech", "Legal AI",
  "Multimodal AI", "Autonomous Systems", "Quantum Security", "Neural Interfaces", "Synthetic Biology", "Marine Robotics", "Holographic Computing", "Quantum Networks", "Industrial Automation", "Data Generation", "Agricultural AI", "Construction AI", "Energy Management", "Synthetic Reality", "Logistics AI", "Quantum Sensing", "Lab Automation", "Transportation AI", "Manufacturing AI", "AGI", "Cultural Heritage"
];

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
  defaultModel: string;
  defaultTools: string[];
  isPublic: boolean;
  version: number;
  isLatest: boolean;
  category?: string;
}

export default function AgentTemplatesPage() {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [useModal, setUseModal] = useState<{ open: boolean; template?: AgentTemplate }>({ open: false });
  const [using, setUsing] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/v1/agents/templates");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTemplates(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Filter and search logic
  const filteredTemplates = templates
    .filter((tpl) =>
      activeCategory === "All" ? true : tpl.category === activeCategory
    )
    .filter((tpl) =>
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description.toLowerCase().includes(search.toLowerCase())
    );

  // Enhanced agent name validation
  const validateAgentName = (name: string) => {
    if (!name.trim()) return 'Agent name is required.';
    if (name.length < 3) return 'Name must be at least 3 characters.';
    if (!/^[\w\s-]+$/.test(name)) return 'Name can only contain letters, numbers, spaces, - and _.';
    return null;
  };

  // Handle agent creation
  const handleUseAgent = async () => {
    const err = validateAgentName(agentName);
    setNameError(err);
    if (err || !useModal.template) return;
    setUsing(true);
    try {
      const res = await fetch('/api/v1/agents/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          templateId: useModal.template.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to create agent');
      const data = await res.json();
      toast.success('Agent created successfully! Redirecting...');
      setUseModal({ open: false });
      setAgentName("");
      setNameError(null);
      window.location.href = `/agents/${data.id}`;
    } catch (e: any) {
      toast.error(e.message || 'Failed to create agent');
    } finally {
      setUsing(false);
    }
  };

  const handleCreate = async (data) => {
    // TODO: Call API to create agent template
    // Optimistic update, error handling, etc.
    return Promise.resolve();
  };

  const getTemplateDetails = (templateName: string) => {
    return templateDetails[templateName] || {
      icon: "🤖",
      color: "#8b5cf6",
      features: ["AI Assistance", "Task Automation", "Smart Responses"],
      useCases: ["General Use", "Task Automation", "Information"],
      rating: 4.5,
      complexity: "Beginner",
      tooltip: "Use this AI agent for general assistance and automation"
    };
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: "auto", 
      py: 6,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h4" fontWeight="bold" mb={3} sx={{ color: 'white', textAlign: 'center' }}>
          Agent Marketplace
        </Typography>
        
        {/* Category Filters */}
        <Stack direction="row" spacing={2} mb={4} flexWrap="wrap" justifyContent="center">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "contained" : "outlined"}
              color={activeCategory === cat ? "primary" : "inherit"}
              onClick={() => setActiveCategory(cat)}
              sx={{ 
                borderRadius: 2, 
                fontWeight: 600,
                backgroundColor: activeCategory === cat ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: activeCategory === cat ? '2px solid rgba(255, 255, 255, 0.5)' : '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                }
              }}
            >
              {categoryIcons[cat] || categoryIcons.Default} {cat}
            </Button>
          ))}
        </Stack>
        
        {/* Search */}
        <Box mb={4} sx={{ textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-6 py-3 rounded-full border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-white/20 w-full max-w-md bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
            style={{
              fontSize: '16px',
              color: 'white'
            }}
          />
        </Box>
        
        {/* Create Agent Template Form */}
        <AgentTemplateForm onSubmit={handleCreate} />
        
        {/* Grid of Cards */}
        {loading ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}><CircularProgress sx={{ color: 'white' }} /></Box>
        ) : error ? (
          <Box sx={{ color: 'white', textAlign: 'center', mt: 8 }}><Typography>Error: {error}</Typography></Box>
        ) : filteredTemplates.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography sx={{ color: 'white' }}>No agent templates found.</Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl, idx) => {
              const details = getTemplateDetails(tpl.name);
              return (
                <Fade in timeout={400 + idx * 80} key={tpl.id}>
                  <div>
                    <CardComponent
                      title={tpl.name}
                      subtitle={tpl.description}
                      variant="elevated"
                      size="lg"
                      headerAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={tpl.category || 'General'} 
                            size="small" 
                            sx={{ 
                              backgroundColor: details.color, 
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Chip 
                            label={details.complexity} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: details.color,
                              color: details.color,
                              fontWeight: 'bold'
                            }}
                          />
                        </Stack>
                      }
                      footer={
                        <Tooltip title={details.tooltip} arrow placement="top">
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setUseModal({ open: true, template: tpl })}
                            startIcon={<SmartToyIcon />}
                            endIcon={<PlayArrowIcon />}
                            sx={{ 
                              background: `linear-gradient(135deg, ${details.color} 0%, ${details.color}dd 50%, #8b5cf6 100%)`,
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '16px',
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: 'none',
                              boxShadow: `0 8px 32px ${details.color}40`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${details.color}dd 0%, ${details.color} 50%, #7c3aed 100%)`,
                                boxShadow: `0 12px 40px ${details.color}60`,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Use This Agent
                          </Button>
                        </Tooltip>
                      }
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {/* Template Icon */}
                      <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            fontSize: '2rem',
                            background: `linear-gradient(135deg, ${details.color} 0%, ${details.color}dd 100%)`,
                            margin: '0 auto',
                            mb: 2,
                            boxShadow: `0 8px 24px ${details.color}40`,
                            border: '3px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          {details.icon}
                        </Avatar>
                      </Box>

                      {/* Rating */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <Rating 
                          value={details.rating} 
                          precision={0.1} 
                          readOnly 
                          size="small"
                          sx={{ 
                            '& .MuiRating-iconFilled': { color: '#FFD700' },
                            '& .MuiRating-iconEmpty': { color: 'rgba(255, 255, 255, 0.3)' }
                          }}
                        />
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 500 }}>
                          {details.rating}
                        </Typography>
                      </Box>

                      {/* Features */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} color="primary">
                          Key Features:
                        </Typography>
                        <Stack spacing={0.5}>
                          {details.features.slice(0, 3).map((feature, index) => (
                            <Typography key={index} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ color: details.color, marginRight: '8px', fontSize: '16px', fontWeight: 'bold' }}>•</span>
                              {feature}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>

                      {/* Use Cases */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1} color="primary">
                          Perfect for:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {details.useCases.join(', ')}
                        </Typography>
                      </Box>

                      {/* Model Info */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 2,
                        p: 1,
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 1,
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}>
                        <Typography variant="caption" color="text.secondary">
                          Model: {tpl.defaultModel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          v{tpl.version}
                        </Typography>
                      </Box>
                    </CardComponent>
                  </div>
                </Fade>
              );
            })}
          </div>
        )}
      </Box>

      {/* Use Agent Modal */}
      <Modal
        open={useModal.open}
        onClose={() => { setUseModal({ open: false }); setNameError(null); }}
        title={`Use "${useModal.template?.name || ''}" Agent`}
        variant="glass"
        size="md"
        sx={{
          '& .MuiDialog-paper': {
            color: '#ffffff',
            '& .MuiTypography-root': {
              color: 'inherit',
            },
            '& .MuiButton-root': {
              color: 'inherit',
            },
          },
        }}
        actions={{
          primary: {
            label: using ? 'Creating...' : 'Start Using Agent',
            onClick: handleUseAgent,
            disabled: using || !agentName.trim() || !!nameError,
            loading: using,
          },
          cancel: {
            onClick: () => { setUseModal({ open: false }); setNameError(null); },
          },
        }}
      >
        {useModal.template && (
          <Box sx={{ color: 'text.primary' }}>
            {/* Template Info */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3, 
              p: 3, 
              backgroundColor: 'rgba(139, 92, 246, 0.15)', 
              borderRadius: 2,
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>
              <Avatar sx={{ 
                width: 56, 
                height: 56, 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '24px',
                marginRight: 2
              }}>
                {useModal.template ? getTemplateDetails(useModal.template.name).icon : '🤖'}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>
                  {useModal.template?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, lineHeight: 1.4 }}>
                  {useModal.template?.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating 
                    value={useModal.template ? getTemplateDetails(useModal.template.name).rating : 0} 
                    precision={0.1} 
                    readOnly 
                    size="small"
                    sx={{ '& .MuiRating-iconFilled': { color: '#FFD700' } }}
                  />
                  <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 500 }}>
                    {useModal.template ? getTemplateDetails(useModal.template.name).rating : 0}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Agent Name Input */}
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body1" mb={2} fontWeight="bold" sx={{ color: 'text.primary' }}>
                Give your agent a name:
              </Typography>
              <input
                type="text"
                value={agentName}
                onChange={e => {
                  setAgentName(e.target.value);
                  setNameError(validateAgentName(e.target.value));
                }}
                placeholder="e.g., My Personal Assistant, Work Helper, etc."
                className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full bg-white text-gray-900"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  border: '2px solid #d1d5db',
                  fontSize: '16px'
                }}
                autoFocus
              />
              {nameError && (
                <Typography color="error" variant="caption" mt={1} sx={{ display: 'block', fontWeight: 500 }}>
                  {nameError}
                </Typography>
              )}
            </Box>

            {/* Template Details */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" fontWeight="bold" mb={2} sx={{ color: 'text.primary' }}>
                What this agent can do:
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                p: 2,
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {useModal.template && getTemplateDetails(useModal.template.name).features.map((feature, index) => (
                  <Typography 
                    key={index} 
                    variant="body2" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'text.secondary',
                      fontWeight: 500,
                      lineHeight: 1.4
                    }}
                  >
                    <span style={{ 
                      color: useModal.template ? getTemplateDetails(useModal.template.name).color : '#8b5cf6', 
                      marginRight: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </span>
                    {feature}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Additional Info */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <strong>Model:</strong> {useModal.template?.defaultModel} • <strong>Complexity:</strong> {useModal.template ? getTemplateDetails(useModal.template.name).complexity : 'Advanced'}
              </Typography>
            </Box>
          </Box>
        )}
      </Modal>
    </Box>
  );
}