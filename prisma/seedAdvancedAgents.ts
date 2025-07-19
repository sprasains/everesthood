import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const advancedAgents = [
  {
    name: "Multimodal AI Architect",
    description: "Advanced multimodal AI systems integrating text, vision, audio, and sensor data",
    defaultPrompt: "You are a multimodal AI architect. Design and implement systems that process and integrate multiple data modalities simultaneously.",
    defaultModel: "gpt-4o",
    category: "Multimodal AI",
    credentials: {
      required: ["multimodal_datasets", "gpu_clusters", "sensor_networks", "audio_processors"],
      optional: ["edge_devices", "cloud_infrastructure"]
    },
    workflows: {
      multimodalProcessing: {
        steps: ["data_fusion", "cross_modal_learning", "attention_mechanisms", "output_synthesis"],
        outputs: ["unified_representations", "cross_modal_insights", "multimodal_predictions"]
      }
    },
    connectors: ["pytorch", "tensorflow", "huggingface", "opencv", "librosa"],
    metadata: {
      complexity: "Advanced",
      modalities: ["text", "vision", "audio", "sensor", "temporal"]
    }
  },
  {
    name: "Autonomous Drone Fleet Controller",
    description: "Intelligent drone fleet management and autonomous aerial operations",
    defaultPrompt: "You are an autonomous drone fleet controller. Manage multiple drones for surveillance, delivery, and aerial operations.",
    defaultModel: "gpt-4o",
    category: "Autonomous Systems",
    credentials: {
      required: ["drone_hardware", "flight_controllers", "gps_systems", "communication_networks"],
      optional: ["satellite_connectivity", "weather_data"]
    },
    workflows: {
      fleetOperations: {
        steps: ["mission_planning", "collision_avoidance", "formation_flying", "task_allocation"],
        outputs: ["flight_paths", "safety_alerts", "mission_reports"]
      }
    },
    connectors: ["ardupilot", "px4", "ros", "gazebo"],
    metadata: {
      complexity: "Advanced",
      applications: ["surveillance", "delivery", "mapping", "search_rescue"]
    }
  },
  {
    name: "Quantum Cryptography Specialist",
    description: "Quantum-safe cryptography and post-quantum security systems",
    defaultPrompt: "You are a quantum cryptography specialist. Implement quantum-safe cryptographic protocols and post-quantum security.",
    defaultModel: "gpt-4o",
    category: "Quantum Security",
    credentials: {
      required: ["quantum_hardware", "cryptographic_libraries", "key_management", "quantum_networks"],
      optional: ["quantum_simulators", "research_collaborations"]
    },
    workflows: {
      quantumSecurity: {
        steps: ["key_generation", "quantum_distribution", "encryption", "authentication"],
        outputs: ["quantum_keys", "security_protocols", "threat_assessments"]
      }
    },
    connectors: ["qiskit", "cirq", "quantum_networks", "post_quantum_crypto"],
    metadata: {
      complexity: "Advanced",
      protocols: ["bb84", "ekert91", "post_quantum_signatures"]
    }
  },
  {
    name: "Brain-Computer Interface Engineer",
    description: "Neural interface systems and brain-computer communication",
    defaultPrompt: "You are a brain-computer interface engineer. Develop systems for direct neural communication and control.",
    defaultModel: "gpt-4o",
    category: "Neural Interfaces",
    credentials: {
      required: ["eeg_devices", "neural_processors", "signal_processing", "medical_approvals"],
      optional: ["implantable_devices", "research_protocols"]
    },
    workflows: {
      neuralInterface: {
        steps: ["signal_acquisition", "noise_reduction", "feature_extraction", "intent_decoding"],
        outputs: ["neural_commands", "brain_signals", "control_actions"]
      }
    },
    connectors: ["openbci", "labstreaminglayer", "matlab", "python_bci"],
    metadata: {
      complexity: "Advanced",
      applications: ["assistive_technology", "gaming", "medical", "research"]
    }
  },
  {
    name: "Synthetic Biology Designer",
    description: "AI-driven synthetic biology and genetic circuit design",
    defaultPrompt: "You are a synthetic biology designer. Create genetic circuits and biological systems using AI-driven design.",
    defaultModel: "gpt-4o",
    category: "Synthetic Biology",
    credentials: {
      required: ["dna_synthesis", "lab_automation", "genetic_databases", "simulation_tools"],
      optional: ["crispr_tools", "protein_engineering"]
    },
    workflows: {
      geneticDesign: {
        steps: ["circuit_design", "sequence_optimization", "synthesis_planning", "validation"],
        outputs: ["genetic_circuits", "dna_sequences", "expression_predictions"]
      }
    },
    connectors: ["benchling", "snapgene", "biopython", "genbank"],
    metadata: {
      complexity: "Advanced",
      applications: ["biomanufacturing", "therapeutics", "biosensors", "biocomputing"]
    }
  },
  {
    name: "Autonomous Underwater Vehicle Controller",
    description: "Deep sea exploration and autonomous underwater operations",
    defaultPrompt: "You are an autonomous underwater vehicle controller. Manage AUVs for deep sea exploration and research.",
    defaultModel: "gpt-4o",
    category: "Marine Robotics",
    credentials: {
      required: ["auv_hardware", "sonar_systems", "pressure_sensors", "underwater_communication"],
      optional: ["satellite_relay", "oceanographic_data"]
    },
    workflows: {
      underwaterOperations: {
        steps: ["mission_planning", "obstacle_avoidance", "data_collection", "surfacing"],
        outputs: ["oceanographic_data", "mapping_results", "safety_reports"]
      }
    },
    connectors: ["moos", "gazebo_underwater", "ros_marine", "ocean_data"],
    metadata: {
      complexity: "Advanced",
      applications: ["oceanography", "marine_biology", "underwater_archaeology", "resource_exploration"]
    }
  },
  {
    name: "Holographic Display Engineer",
    description: "3D holographic display systems and spatial computing",
    defaultPrompt: "You are a holographic display engineer. Create immersive 3D holographic experiences and spatial computing systems.",
    defaultModel: "gpt-4o",
    category: "Holographic Computing",
    credentials: {
      required: ["holographic_projectors", "spatial_tracking", "3d_rendering", "light_field_displays"],
      optional: ["quantum_dots", "metamaterials"]
    },
    workflows: {
      holographicRendering: {
        steps: ["3d_modeling", "light_field_calculation", "hologram_generation", "display_optimization"],
        outputs: ["holographic_content", "spatial_interactions", "immersive_experiences"]
      }
    },
    connectors: ["unity_holographic", "unreal_engine", "hololens_sdk", "light_field_tools"],
    metadata: {
      complexity: "Advanced",
      technologies: ["light_field", "volumetric", "holographic", "spatial_audio"]
    }
  },
  {
    name: "Quantum Internet Architect",
    description: "Quantum network infrastructure and quantum internet protocols",
    defaultPrompt: "You are a quantum internet architect. Design and implement quantum network infrastructure and protocols.",
    defaultModel: "gpt-4o",
    category: "Quantum Networks",
    credentials: {
      required: ["quantum_repeaters", "entanglement_sources", "quantum_memory", "network_protocols"],
      optional: ["satellite_quantum", "fiber_networks"]
    },
    workflows: {
      quantumNetworking: {
        steps: ["entanglement_distribution", "quantum_routing", "error_correction", "protocol_optimization"],
        outputs: ["quantum_connections", "network_topology", "security_metrics"]
      }
    },
    connectors: ["quantum_networks", "entanglement_protocols", "quantum_repeaters"],
    metadata: {
      complexity: "Advanced",
      protocols: ["quantum_key_distribution", "entanglement_swapping", "quantum_teleportation"]
    }
  },
  {
    name: "Autonomous Mining Operations Manager",
    description: "Intelligent mining automation and resource extraction optimization",
    defaultPrompt: "You are an autonomous mining operations manager. Optimize mining operations using AI and automation.",
    defaultModel: "gpt-4o",
    category: "Industrial Automation",
    credentials: {
      required: ["mining_equipment", "sensor_networks", "geological_data", "safety_systems"],
      optional: ["drone_surveillance", "satellite_imagery"]
    },
    workflows: {
      miningOptimization: {
        steps: ["resource_mapping", "extraction_planning", "equipment_coordination", "safety_monitoring"],
        outputs: ["extraction_plans", "efficiency_metrics", "safety_reports"]
      }
    },
    connectors: ["mining_software", "autonomous_vehicles", "sensor_networks", "geological_dbs"],
    metadata: {
      complexity: "Advanced",
      applications: ["open_pit_mining", "underground_mining", "mineral_processing", "safety_management"]
    }
  },
  {
    name: "Synthetic Data Generation Specialist",
    description: "AI-powered synthetic data creation for privacy and training",
    defaultPrompt: "You are a synthetic data generation specialist. Create high-quality synthetic datasets for AI training and privacy protection.",
    defaultModel: "gpt-4o",
    category: "Data Generation",
    credentials: {
      required: ["generative_models", "data_privacy_tools", "validation_frameworks", "quality_metrics"],
      optional: ["federated_learning", "differential_privacy"]
    },
    workflows: {
      syntheticDataCreation: {
        steps: ["data_analysis", "model_training", "generation", "validation", "privacy_audit"],
        outputs: ["synthetic_datasets", "quality_reports", "privacy_guarantees"]
      }
    },
    connectors: ["synthea", "gans", "diffusion_models", "privacy_tools"],
    metadata: {
      complexity: "Advanced",
      dataTypes: ["tabular", "images", "text", "time_series", "multimodal"]
    }
  },
  {
    name: "Autonomous Agricultural Systems Engineer",
    description: "Smart farming and precision agriculture automation",
    defaultPrompt: "You are an autonomous agricultural systems engineer. Optimize farming operations using AI and robotics.",
    defaultModel: "gpt-4o",
    category: "Agricultural AI",
    credentials: {
      required: ["agricultural_robots", "soil_sensors", "weather_data", "crop_models"],
      optional: ["satellite_imagery", "drone_systems"]
    },
    workflows: {
      precisionAgriculture: {
        steps: ["crop_monitoring", "soil_analysis", "irrigation_optimization", "harvest_planning"],
        outputs: ["crop_recommendations", "resource_optimization", "yield_predictions"]
      }
    },
    connectors: ["farm_management_software", "iot_sensors", "autonomous_tractors", "weather_apis"],
    metadata: {
      complexity: "Advanced",
      applications: ["crop_monitoring", "soil_management", "irrigation", "harvest_optimization"]
    }
  },
  {
    name: "Quantum Machine Learning Engineer",
    description: "Quantum-enhanced machine learning and quantum neural networks",
    defaultPrompt: "You are a quantum machine learning engineer. Develop quantum-enhanced ML algorithms and quantum neural networks.",
    defaultModel: "gpt-4o",
    category: "Quantum ML",
    credentials: {
      required: ["quantum_hardware", "ml_frameworks", "quantum_simulators", "hybrid_algorithms"],
      optional: ["quantum_datasets", "research_collaborations"]
    },
    workflows: {
      quantumML: {
        steps: ["problem_quantization", "quantum_circuit_design", "hybrid_training", "performance_analysis"],
        outputs: ["quantum_models", "hybrid_algorithms", "performance_benchmarks"]
      }
    },
    connectors: ["tensorflow_quantum", "pennylane", "qiskit_machine_learning", "cirq"],
    metadata: {
      complexity: "Advanced",
      algorithms: ["quantum_neural_networks", "quantum_kernels", "variational_quantum_circuits"]
    }
  },
  {
    name: "Autonomous Construction Manager",
    description: "AI-driven construction automation and building optimization",
    defaultPrompt: "You are an autonomous construction manager. Optimize construction processes using AI and robotics.",
    defaultModel: "gpt-4o",
    category: "Construction AI",
    credentials: {
      required: ["construction_robots", "bim_software", "safety_systems", "project_management"],
      optional: ["3d_printing", "modular_construction"]
    },
    workflows: {
      constructionOptimization: {
        steps: ["project_planning", "resource_allocation", "safety_monitoring", "quality_control"],
        outputs: ["construction_plans", "safety_alerts", "progress_reports"]
      }
    },
    connectors: ["bim_software", "construction_robots", "safety_systems", "project_management"],
    metadata: {
      complexity: "Advanced",
      applications: ["prefabrication", "3d_printing", "modular_construction", "safety_management"]
    }
  },
  {
    name: "Neuromorphic Computing Architect",
    description: "Brain-inspired computing systems and spiking neural networks",
    defaultPrompt: "You are a neuromorphic computing architect. Design brain-inspired computing systems and spiking neural networks.",
    defaultModel: "gpt-4o",
    category: "Neuromorphic",
    credentials: {
      required: ["neuromorphic_hardware", "spiking_networks", "brain_data", "cognitive_architectures"],
      optional: ["memristors", "quantum_neuromorphic"]
    },
    workflows: {
      neuromorphicDesign: {
        steps: ["neuron_modeling", "network_architecture", "hardware_mapping", "learning_algorithms"],
        outputs: ["neuromorphic_systems", "cognitive_models", "efficiency_metrics"]
      }
    },
    connectors: ["brian", "nest", "spinnaker", "loihi"],
    metadata: {
      complexity: "Advanced",
      applications: ["edge_ai", "cognitive_computing", "brain_computer_interfaces", "robotics"]
    }
  },
  {
    name: "Autonomous Energy Grid Controller",
    description: "Smart grid optimization and renewable energy integration",
    defaultPrompt: "You are an autonomous energy grid controller. Optimize energy distribution and integrate renewable sources.",
    defaultModel: "gpt-4o",
    category: "Energy Management",
    credentials: {
      required: ["grid_control_systems", "renewable_sources", "energy_storage", "demand_response"],
      optional: ["microgrids", "vehicle_to_grid"]
    },
    workflows: {
      gridOptimization: {
        steps: ["load_forecasting", "generation_optimization", "grid_balancing", "demand_response"],
        outputs: ["grid_stability", "energy_efficiency", "cost_optimization"]
      }
    },
    connectors: ["scada", "energy_management", "renewable_sources", "storage_systems"],
    metadata: {
      complexity: "Advanced",
      applications: ["smart_grids", "microgrids", "renewable_integration", "demand_response"]
    }
  },
  {
    name: "Synthetic Reality Creator",
    description: "AI-generated virtual worlds and synthetic reality systems",
    defaultPrompt: "You are a synthetic reality creator. Generate immersive virtual worlds and synthetic reality experiences.",
    defaultModel: "gpt-4o",
    category: "Synthetic Reality",
    credentials: {
      required: ["3d_engines", "ai_generation", "vr_ar_platforms", "content_creation"],
      optional: ["haptic_feedback", "brain_computer_interfaces"]
    },
    workflows: {
      realityGeneration: {
        steps: ["world_design", "ai_generation", "interaction_design", "immersion_optimization"],
        outputs: ["virtual_worlds", "interactive_experiences", "immersive_content"]
      }
    },
    connectors: ["unreal_engine", "unity", "ai_generation_tools", "vr_platforms"],
    metadata: {
      complexity: "Advanced",
      technologies: ["ai_generation", "virtual_reality", "augmented_reality", "mixed_reality"]
    }
  },
  {
    name: "Autonomous Logistics Coordinator",
    description: "Intelligent supply chain and logistics optimization",
    defaultPrompt: "You are an autonomous logistics coordinator. Optimize supply chain operations and logistics using AI.",
    defaultModel: "gpt-4o",
    category: "Logistics AI",
    credentials: {
      required: ["logistics_software", "autonomous_vehicles", "warehouse_automation", "tracking_systems"],
      optional: ["blockchain", "iot_sensors"]
    },
    workflows: {
      logisticsOptimization: {
        steps: ["route_planning", "inventory_optimization", "warehouse_automation", "delivery_optimization"],
        outputs: ["optimized_routes", "inventory_reports", "delivery_metrics"]
      }
    },
    connectors: ["logistics_software", "autonomous_vehicles", "warehouse_systems", "tracking_apis"],
    metadata: {
      complexity: "Advanced",
      applications: ["route_optimization", "warehouse_automation", "last_mile_delivery", "inventory_management"]
    }
  },
  {
    name: "Quantum Sensing Specialist",
    description: "Quantum sensors and ultra-precise measurement systems",
    defaultPrompt: "You are a quantum sensing specialist. Develop quantum sensors for ultra-precise measurements and detection.",
    defaultModel: "gpt-4o",
    category: "Quantum Sensing",
    credentials: {
      required: ["quantum_sensors", "measurement_systems", "calibration_tools", "noise_reduction"],
      optional: ["quantum_imaging", "entanglement_sensors"]
    },
    workflows: {
      quantumSensing: {
        steps: ["sensor_calibration", "quantum_measurement", "noise_reduction", "data_analysis"],
        outputs: ["precise_measurements", "sensor_data", "calibration_reports"]
      }
    },
    connectors: ["quantum_sensors", "measurement_systems", "calibration_tools"],
    metadata: {
      complexity: "Advanced",
      sensorTypes: ["atomic_clocks", "quantum_magnetometers", "quantum_gravimeters", "quantum_imaging"]
    }
  },
  {
    name: "Autonomous Healthcare Systems Manager",
    description: "AI-driven healthcare automation and medical robotics",
    defaultPrompt: "You are an autonomous healthcare systems manager. Optimize healthcare operations using AI and robotics.",
    defaultModel: "gpt-4o",
    category: "Healthcare AI",
    credentials: {
      required: ["medical_robots", "healthcare_software", "patient_data", "regulatory_compliance"],
      optional: ["telemedicine", "wearable_devices"]
    },
    workflows: {
      healthcareOptimization: {
        steps: ["patient_monitoring", "diagnostic_assistance", "treatment_planning", "outcome_tracking"],
        outputs: ["health_recommendations", "treatment_plans", "outcome_analytics"]
      }
    },
    connectors: ["electronic_health_records", "medical_robots", "diagnostic_tools", "telemedicine"],
    metadata: {
      complexity: "Advanced",
      applications: ["diagnostic_assistance", "surgical_robotics", "patient_monitoring", "drug_discovery"]
    }
  },
  {
    name: "Synthetic Biology Automation Engineer",
    description: "Automated laboratory systems and synthetic biology workflows",
    defaultPrompt: "You are a synthetic biology automation engineer. Automate laboratory processes and synthetic biology workflows.",
    defaultModel: "gpt-4o",
    category: "Lab Automation",
    credentials: {
      required: ["lab_automation", "robotic_systems", "biochemical_assays", "data_management"],
      optional: ["crispr_automation", "protein_engineering"]
    },
    workflows: {
      labAutomation: {
        steps: ["experiment_design", "automated_execution", "data_collection", "analysis"],
        outputs: ["experimental_results", "automation_reports", "data_analytics"]
      }
    },
    connectors: ["lab_automation_software", "robotic_systems", "biochemical_tools", "data_platforms"],
    metadata: {
      complexity: "Advanced",
      applications: ["dna_synthesis", "protein_expression", "screening_assays", "biomanufacturing"]
    }
  },
  {
    name: "Autonomous Transportation Network Manager",
    description: "Intelligent transportation systems and autonomous vehicle coordination",
    defaultPrompt: "You are an autonomous transportation network manager. Coordinate autonomous vehicles and optimize transportation networks.",
    defaultModel: "gpt-4o",
    category: "Transportation AI",
    credentials: {
      required: ["autonomous_vehicles", "traffic_management", "communication_networks", "safety_systems"],
      optional: ["smart_cities", "mobility_as_service"]
    },
    workflows: {
      transportationOptimization: {
        steps: ["traffic_analysis", "route_optimization", "vehicle_coordination", "safety_monitoring"],
        outputs: ["traffic_optimization", "safety_alerts", "efficiency_metrics"]
      }
    },
    connectors: ["traffic_management", "autonomous_vehicles", "communication_networks", "smart_city_apis"],
    metadata: {
      complexity: "Advanced",
      applications: ["autonomous_vehicles", "traffic_optimization", "mobility_services", "safety_management"]
    }
  },
  {
    name: "Quantum Communication Engineer",
    description: "Quantum communication protocols and secure quantum networks",
    defaultPrompt: "You are a quantum communication engineer. Implement quantum communication protocols and secure quantum networks.",
    defaultModel: "gpt-4o",
    category: "Quantum Communication",
    credentials: {
      required: ["quantum_communication", "entanglement_sources", "quantum_memory", "network_protocols"],
      optional: ["satellite_quantum", "quantum_repeaters"]
    },
    workflows: {
      quantumCommunication: {
        steps: ["entanglement_distribution", "quantum_routing", "error_correction", "security_validation"],
        outputs: ["quantum_connections", "security_protocols", "network_performance"]
      }
    },
    connectors: ["quantum_communication", "entanglement_protocols", "quantum_networks"],
    metadata: {
      complexity: "Advanced",
      protocols: ["quantum_key_distribution", "quantum_teleportation", "entanglement_swapping"]
    }
  },
  {
    name: "Autonomous Manufacturing Systems Engineer",
    description: "Smart manufacturing and Industry 4.0 automation",
    defaultPrompt: "You are an autonomous manufacturing systems engineer. Optimize manufacturing processes using AI and automation.",
    defaultModel: "gpt-4o",
    category: "Manufacturing AI",
    credentials: {
      required: ["manufacturing_robots", "iot_sensors", "quality_control", "production_planning"],
      optional: ["3d_printing", "additive_manufacturing"]
    },
    workflows: {
      manufacturingOptimization: {
        steps: ["production_planning", "quality_control", "predictive_maintenance", "optimization"],
        outputs: ["production_plans", "quality_reports", "maintenance_schedules"]
      }
    },
    connectors: ["manufacturing_execution_systems", "industrial_robots", "iot_platforms", "quality_control"],
    metadata: {
      complexity: "Advanced",
      applications: ["predictive_maintenance", "quality_control", "production_optimization", "supply_chain"]
    }
  },
  {
    name: "Synthetic Intelligence Architect",
    description: "Artificial general intelligence and synthetic consciousness systems",
    defaultPrompt: "You are a synthetic intelligence architect. Design artificial general intelligence and synthetic consciousness systems.",
    defaultModel: "gpt-4o",
    category: "AGI",
    credentials: {
      required: ["cognitive_architectures", "reasoning_systems", "learning_algorithms", "consciousness_models"],
      optional: ["quantum_computing", "neuromorphic_hardware"]
    },
    workflows: {
      agiDevelopment: {
        steps: ["cognitive_modeling", "reasoning_implementation", "learning_integration", "consciousness_development"],
        outputs: ["agi_systems", "cognitive_models", "consciousness_frameworks"]
      }
    },
    connectors: ["cognitive_architectures", "reasoning_engines", "learning_frameworks"],
    metadata: {
      complexity: "Advanced",
      capabilities: ["general_intelligence", "reasoning", "learning", "consciousness"]
    }
  },
  {
    name: "Autonomous Space Station Manager",
    description: "Intelligent space station operations and autonomous space systems",
    defaultPrompt: "You are an autonomous space station manager. Manage space station operations and autonomous space systems.",
    defaultModel: "gpt-4o",
    category: "Space Systems",
    credentials: {
      required: ["space_systems", "life_support", "power_management", "communication_systems"],
      optional: ["robotic_arms", "satellite_networks"]
    },
    workflows: {
      spaceOperations: {
        steps: ["system_monitoring", "resource_management", "safety_control", "mission_execution"],
        outputs: ["system_status", "resource_reports", "safety_alerts"]
      }
    },
    connectors: ["space_systems", "life_support", "power_management", "communication"],
    metadata: {
      complexity: "Advanced",
      applications: ["life_support", "power_management", "safety_systems", "mission_control"]
    }
  },
  {
    name: "Quantum Materials Scientist",
    description: "Quantum materials design and quantum device engineering",
    defaultPrompt: "You are a quantum materials scientist. Design quantum materials and engineer quantum devices.",
    defaultModel: "gpt-4o",
    category: "Quantum Materials",
    credentials: {
      required: ["quantum_materials", "fabrication_tools", "characterization_equipment", "simulation_software"],
      optional: ["quantum_simulators", "research_facilities"]
    },
    workflows: {
      quantumMaterials: {
        steps: ["material_design", "fabrication", "characterization", "device_integration"],
        outputs: ["quantum_materials", "device_prototypes", "characterization_data"]
      }
    },
    connectors: ["materials_databases", "fabrication_tools", "characterization_equipment"],
    metadata: {
      complexity: "Advanced",
      materials: ["topological_insulators", "superconductors", "quantum_dots", "metamaterials"]
    }
  },
  {
    name: "Autonomous Disaster Response Coordinator",
    description: "Intelligent disaster response and emergency management systems",
    defaultPrompt: "You are an autonomous disaster response coordinator. Coordinate disaster response and emergency management.",
    defaultModel: "gpt-4o",
    category: "Emergency Management",
    credentials: {
      required: ["emergency_systems", "communication_networks", "sensor_networks", "response_robots"],
      optional: ["satellite_imagery", "drone_fleets"]
    },
    workflows: {
      disasterResponse: {
        steps: ["situation_assessment", "resource_allocation", "response_coordination", "recovery_planning"],
        outputs: ["response_plans", "resource_reports", "safety_alerts"]
      }
    },
    connectors: ["emergency_systems", "communication_networks", "sensor_networks", "response_robots"],
    metadata: {
      complexity: "Advanced",
      applications: ["natural_disasters", "emergency_response", "search_rescue", "recovery_planning"]
    }
  },
  {
    name: "Synthetic Ecosystem Designer",
    description: "AI-designed ecosystems and synthetic biology environments",
    defaultPrompt: "You are a synthetic ecosystem designer. Design artificial ecosystems and synthetic biology environments.",
    defaultModel: "gpt-4o",
    category: "Synthetic Ecosystems",
    credentials: {
      required: ["ecosystem_models", "biological_systems", "environmental_control", "monitoring_systems"],
      optional: ["bioreactors", "genetic_engineering"]
    },
    workflows: {
      ecosystemDesign: {
        steps: ["ecosystem_modeling", "species_selection", "environmental_control", "monitoring"],
        outputs: ["ecosystem_designs", "stability_models", "monitoring_data"]
      }
    },
    connectors: ["ecosystem_models", "biological_systems", "environmental_control"],
    metadata: {
      complexity: "Advanced",
      applications: ["bioremediation", "agriculture", "conservation", "research"]
    }
  },
  {
    name: "Autonomous Research Laboratory Manager",
    description: "Intelligent laboratory automation and autonomous research systems",
    defaultPrompt: "You are an autonomous research laboratory manager. Automate laboratory processes and manage autonomous research.",
    defaultModel: "gpt-4o",
    category: "Research Automation",
    credentials: {
      required: ["lab_automation", "research_robots", "data_management", "experiment_design"],
      optional: ["ai_assistants", "collaborative_robots"]
    },
    workflows: {
      researchAutomation: {
        steps: ["experiment_design", "automated_execution", "data_collection", "analysis"],
        outputs: ["research_results", "automation_reports", "data_analytics"]
      }
    },
    connectors: ["lab_automation", "research_robots", "data_management", "experiment_design"],
    metadata: {
      complexity: "Advanced",
      applications: ["drug_discovery", "materials_science", "biology", "chemistry"]
    }
  },
  {
    name: "Quantum Internet Security Specialist",
    description: "Quantum internet security and quantum-safe communication",
    defaultPrompt: "You are a quantum internet security specialist. Implement quantum internet security and quantum-safe communication.",
    defaultModel: "gpt-4o",
    category: "Quantum Security",
    credentials: {
      required: ["quantum_networks", "security_protocols", "cryptographic_tools", "quantum_hardware"],
      optional: ["post_quantum_crypto", "quantum_key_distribution"]
    },
    workflows: {
      quantumSecurity: {
        steps: ["security_assessment", "protocol_implementation", "key_management", "threat_monitoring"],
        outputs: ["security_protocols", "threat_assessments", "security_reports"]
      }
    },
    connectors: ["quantum_networks", "security_protocols", "cryptographic_tools"],
    metadata: {
      complexity: "Advanced",
      protocols: ["quantum_key_distribution", "post_quantum_cryptography", "quantum_authentication"]
    }
  },
  {
    name: "Autonomous Cultural Heritage Preservationist",
    description: "AI-driven cultural heritage preservation and restoration",
    defaultPrompt: "You are an autonomous cultural heritage preservationist. Preserve and restore cultural heritage using AI and robotics.",
    defaultModel: "gpt-4o",
    category: "Cultural Heritage",
    credentials: {
      required: ["preservation_tools", "3d_scanning", "restoration_robots", "cultural_databases"],
      optional: ["virtual_reconstruction", "ar_restoration"]
    },
    workflows: {
      heritagePreservation: {
        steps: ["artifact_analysis", "damage_assessment", "restoration_planning", "preservation_execution"],
        outputs: ["preservation_plans", "restoration_reports", "digital_archives"]
      }
    },
    connectors: ["3d_scanning", "restoration_robots", "cultural_databases", "preservation_tools"],
    metadata: {
      complexity: "Advanced",
      applications: ["artifact_preservation", "monument_restoration", "digital_archiving", "virtual_reconstruction"]
    }
  }
];

async function seedAdvancedAgents() {
  console.log('🌱 Seeding advanced agents...');
  
  for (const agent of advancedAgents) {
    try {
      await prisma.agentTemplate.upsert({
        where: { name: agent.name },
        update: {
          description: agent.description,
          defaultPrompt: agent.defaultPrompt,
          defaultModel: agent.defaultModel,
          category: agent.category,
          credentials: agent.credentials,
          workflows: agent.workflows,
          workflowRelationships: agent.workflows ? { relationships: "defined_in_workflows" } : null,
          connectors: agent.connectors,
          metadata: agent.metadata,
          capabilities: agent.metadata,
          integrations: agent.connectors,
          securityConfig: { compliance: agent.metadata?.compliance || [] },
          performanceMetrics: { complexity: agent.metadata?.complexity || "Advanced" },
          customFields: { domain: agent.category }
        },
        create: {
          name: agent.name,
          description: agent.description,
          defaultPrompt: agent.defaultPrompt,
          defaultModel: agent.defaultModel,
          category: agent.category,
          credentials: agent.credentials,
          workflows: agent.workflows,
          workflowRelationships: agent.workflows ? { relationships: "defined_in_workflows" } : null,
          connectors: agent.connectors,
          metadata: agent.metadata,
          capabilities: agent.metadata,
          integrations: agent.connectors,
          securityConfig: { compliance: agent.metadata?.compliance || [] },
          performanceMetrics: { complexity: agent.metadata?.complexity || "Advanced" },
          customFields: { domain: agent.category }
        }
      });
      console.log(`✅ Created/Updated: ${agent.name}`);
    } catch (error) {
      console.error(`❌ Error creating ${agent.name}:`, error);
    }
  }
  
  console.log('🎉 Advanced agents seeding completed!');
}

seedAdvancedAgents()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 