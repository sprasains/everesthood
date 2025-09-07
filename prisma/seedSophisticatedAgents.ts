import { PrismaClient } from '@prisma/client';

const { prisma } = require('../lib/prisma');

const sophisticatedAgents = [
  {
    name: 'Enterprise Data Analyst',
    description:
      'Advanced data analysis and business intelligence agent with multi-source data integration',
    defaultPrompt:
      'You are an enterprise data analyst. Analyze complex datasets, create visualizations, and provide actionable business insights.',
    defaultModel: 'gpt-4o',
    category: 'Analytics',
    credentials: {
      required: ['database_connection', 'api_keys', 'bi_tool_access'],
      optional: ['cloud_storage', 'ml_platform'],
    },
    workflows: {
      dataCollection: {
        steps: [
          'connect_sources',
          'validate_data',
          'transform_data',
          'load_warehouse',
        ],
        triggers: ['scheduled', 'manual', 'event_driven'],
      },
      analysis: {
        steps: [
          'exploratory_analysis',
          'statistical_testing',
          'trend_identification',
          'anomaly_detection',
        ],
        outputs: ['reports', 'dashboards', 'alerts'],
      },
    },
    connectors: ['snowflake', 'tableau', 'powerbi', 'python', 'r', 'sql'],
    metadata: {
      complexity: 'Advanced',
      dataTypes: ['structured', 'unstructured', 'real-time'],
      compliance: ['GDPR', 'SOX', 'HIPAA'],
    },
  },
  {
    name: 'AI Research Scientist',
    description: 'Cutting-edge AI research and model development agent',
    defaultPrompt:
      'You are an AI research scientist. Conduct research, develop models, and advance AI capabilities.',
    defaultModel: 'gpt-4o',
    category: 'AI',
    credentials: {
      required: ['gpu_access', 'research_datasets', 'ml_frameworks'],
      optional: ['cloud_compute', 'research_papers'],
    },
    workflows: {
      research: {
        steps: [
          'literature_review',
          'hypothesis_formulation',
          'experiment_design',
          'model_development',
        ],
        outputs: ['papers', 'models', 'patents'],
      },
    },
    connectors: ['pytorch', 'tensorflow', 'huggingface', 'arxiv', 'github'],
    metadata: {
      complexity: 'Advanced',
      domains: ['nlp', 'computer_vision', 'reinforcement_learning'],
    },
  },
  {
    name: 'Cybersecurity Threat Hunter',
    description: 'Advanced threat detection and cybersecurity analysis agent',
    defaultPrompt:
      'You are a cybersecurity threat hunter. Detect, analyze, and respond to security threats.',
    defaultModel: 'gpt-4o',
    category: 'Security',
    credentials: {
      required: ['siem_access', 'threat_intel', 'network_logs'],
      optional: ['vpn_access', 'forensic_tools'],
    },
    workflows: {
      threatHunting: {
        steps: [
          'log_analysis',
          'pattern_recognition',
          'threat_correlation',
          'incident_response',
        ],
        outputs: ['threat_reports', 'mitigation_plans'],
      },
    },
    connectors: ['splunk', 'elasticsearch', 'crowdstrike', 'virustotal'],
    metadata: {
      complexity: 'Advanced',
      threatTypes: ['malware', 'phishing', 'apt', 'ransomware'],
    },
  },
  {
    name: 'Quantum Computing Specialist',
    description:
      'Quantum algorithm development and quantum computing research agent',
    defaultPrompt:
      'You are a quantum computing specialist. Develop quantum algorithms and optimize quantum circuits.',
    defaultModel: 'gpt-4o',
    category: 'Quantum',
    credentials: {
      required: [
        'quantum_simulator',
        'quantum_hardware',
        'algorithm_libraries',
      ],
      optional: ['research_grants', 'academic_access'],
    },
    workflows: {
      quantumDevelopment: {
        steps: [
          'problem_analysis',
          'quantum_mapping',
          'circuit_design',
          'optimization',
        ],
        outputs: ['quantum_circuits', 'algorithms', 'research_papers'],
      },
    },
    connectors: ['qiskit', 'cirq', 'pennylane', 'ibm_quantum'],
    metadata: {
      complexity: 'Advanced',
      applications: ['cryptography', 'optimization', 'simulation'],
    },
  },
  {
    name: 'Blockchain Architect',
    description:
      'Smart contract development and blockchain infrastructure design agent',
    defaultPrompt:
      'You are a blockchain architect. Design and develop smart contracts and blockchain solutions.',
    defaultModel: 'gpt-4o',
    category: 'Blockchain',
    credentials: {
      required: ['blockchain_nodes', 'development_tools', 'test_networks'],
      optional: ['mainnet_access', 'oracle_services'],
    },
    workflows: {
      smartContractDev: {
        steps: [
          'requirements_analysis',
          'contract_design',
          'development',
          'testing',
          'deployment',
        ],
        outputs: ['smart_contracts', 'dapps', 'documentation'],
      },
    },
    connectors: ['ethereum', 'polygon', 'solana', 'hardhat', 'truffle'],
    metadata: {
      complexity: 'Advanced',
      protocols: ['defi', 'nft', 'dao', 'layer2'],
    },
  },
  {
    name: 'IoT Platform Manager',
    description:
      'Internet of Things device management and data processing agent',
    defaultPrompt:
      'You are an IoT platform manager. Manage devices, process sensor data, and optimize IoT networks.',
    defaultModel: 'gpt-4o',
    category: 'IoT',
    credentials: {
      required: ['device_registry', 'mqtt_broker', 'time_series_db'],
      optional: ['edge_computing', '5g_network'],
    },
    workflows: {
      deviceManagement: {
        steps: [
          'device_onboarding',
          'data_collection',
          'processing',
          'analytics',
        ],
        outputs: ['device_status', 'alerts', 'insights'],
      },
    },
    connectors: ['aws_iot', 'azure_iot', 'google_cloud_iot', 'influxdb'],
    metadata: {
      complexity: 'Intermediate',
      protocols: ['mqtt', 'coap', 'http', 'websockets'],
    },
  },
  {
    name: 'DevOps Automation Engineer',
    description:
      'CI/CD pipeline automation and infrastructure management agent',
    defaultPrompt:
      'You are a DevOps automation engineer. Automate deployments, manage infrastructure, and optimize workflows.',
    defaultModel: 'gpt-4o',
    category: 'DevOps',
    credentials: {
      required: ['cloud_access', 'git_repositories', 'container_registry'],
      optional: ['monitoring_tools', 'security_scanners'],
    },
    workflows: {
      deployment: {
        steps: [
          'code_analysis',
          'testing',
          'building',
          'deployment',
          'monitoring',
        ],
        outputs: ['deployment_status', 'performance_metrics'],
      },
    },
    connectors: ['jenkins', 'github_actions', 'docker', 'kubernetes'],
    metadata: {
      complexity: 'Advanced',
      practices: ['gitops', 'infrastructure_as_code', 'blue_green_deployment'],
    },
  },
  {
    name: 'Machine Learning Operations Engineer',
    description:
      'ML model deployment, monitoring, and lifecycle management agent',
    defaultPrompt:
      'You are an MLOps engineer. Deploy, monitor, and maintain machine learning models in production.',
    defaultModel: 'gpt-4o',
    category: 'MLOps',
    credentials: {
      required: [
        'model_registry',
        'monitoring_platform',
        'deployment_platform',
      ],
      optional: ['feature_store', 'experiment_tracking'],
    },
    workflows: {
      modelLifecycle: {
        steps: [
          'model_training',
          'validation',
          'deployment',
          'monitoring',
          'retraining',
        ],
        outputs: ['model_performance', 'drift_alerts', 'retraining_triggers'],
      },
    },
    connectors: ['mlflow', 'kubeflow', 'sagemaker', 'vertex_ai'],
    metadata: {
      complexity: 'Advanced',
      capabilities: ['model_versioning', 'a_b_testing', 'automated_retraining'],
    },
  },
  {
    name: 'Natural Language Processing Expert',
    description: 'Advanced NLP model development and text analysis agent',
    defaultPrompt:
      'You are an NLP expert. Develop language models, analyze text, and build conversational AI.',
    defaultModel: 'gpt-4o',
    category: 'NLP',
    credentials: {
      required: ['language_datasets', 'transformer_models', 'gpu_resources'],
      optional: ['multilingual_data', 'domain_specific_corpus'],
    },
    workflows: {
      textAnalysis: {
        steps: [
          'preprocessing',
          'feature_extraction',
          'model_training',
          'evaluation',
        ],
        outputs: [
          'sentiment_analysis',
          'entity_recognition',
          'text_classification',
        ],
      },
    },
    connectors: ['huggingface', 'spacy', 'nltk', 'transformers'],
    metadata: {
      complexity: 'Advanced',
      tasks: [
        'sentiment_analysis',
        'named_entity_recognition',
        'text_summarization',
      ],
    },
  },
  {
    name: 'Computer Vision Engineer',
    description:
      'Image and video processing, object detection, and computer vision agent',
    defaultPrompt:
      'You are a computer vision engineer. Process images, detect objects, and build vision-based AI systems.',
    defaultModel: 'gpt-4o',
    category: 'Computer Vision',
    credentials: {
      required: ['image_datasets', 'gpu_resources', 'vision_models'],
      optional: ['camera_systems', 'video_streams'],
    },
    workflows: {
      imageProcessing: {
        steps: [
          'image_preprocessing',
          'feature_extraction',
          'object_detection',
          'classification',
        ],
        outputs: ['detected_objects', 'image_annotations', 'analysis_reports'],
      },
    },
    connectors: ['opencv', 'tensorflow', 'pytorch', 'yolo'],
    metadata: {
      complexity: 'Advanced',
      applications: [
        'object_detection',
        'facial_recognition',
        'medical_imaging',
      ],
    },
  },
  {
    name: 'Robotics Control Systems Engineer',
    description: 'Robot programming, control systems, and automation agent',
    defaultPrompt:
      'You are a robotics control systems engineer. Program robots, design control systems, and optimize automation.',
    defaultModel: 'gpt-4o',
    category: 'Robotics',
    credentials: {
      required: ['robot_hardware', 'control_software', 'sensor_data'],
      optional: ['simulation_environment', 'real_world_testing'],
    },
    workflows: {
      robotControl: {
        steps: [
          'sensor_fusion',
          'path_planning',
          'motion_control',
          'collision_avoidance',
        ],
        outputs: ['robot_commands', 'safety_alerts', 'performance_metrics'],
      },
    },
    connectors: ['ros', 'gazebo', 'moveit', 'arduino'],
    metadata: {
      complexity: 'Advanced',
      robotTypes: ['mobile_robots', 'manipulators', 'autonomous_vehicles'],
    },
  },
  {
    name: 'Augmented Reality Developer',
    description: 'AR application development and spatial computing agent',
    defaultPrompt:
      'You are an AR developer. Create immersive AR experiences and spatial computing applications.',
    defaultModel: 'gpt-4o',
    category: 'AR/VR',
    credentials: {
      required: ['ar_sdk', '3d_models', 'spatial_mapping'],
      optional: ['ar_hardware', 'cloud_anchors'],
    },
    workflows: {
      arDevelopment: {
        steps: [
          'environment_mapping',
          'content_creation',
          'interaction_design',
          'testing',
        ],
        outputs: ['ar_applications', '3d_content', 'user_experiences'],
      },
    },
    connectors: ['unity', 'unreal_engine', 'arkit', 'arcore'],
    metadata: {
      complexity: 'Intermediate',
      platforms: ['mobile_ar', 'headset_ar', 'web_ar'],
    },
  },
  {
    name: 'Edge Computing Specialist',
    description: 'Edge device optimization and distributed computing agent',
    defaultPrompt:
      'You are an edge computing specialist. Optimize edge devices and manage distributed computing resources.',
    defaultModel: 'gpt-4o',
    category: 'Edge Computing',
    credentials: {
      required: ['edge_devices', 'distributed_storage', 'network_config'],
      optional: ['5g_network', 'satellite_connectivity'],
    },
    workflows: {
      edgeOptimization: {
        steps: [
          'resource_allocation',
          'load_balancing',
          'latency_optimization',
          'power_management',
        ],
        outputs: ['performance_metrics', 'optimization_recommendations'],
      },
    },
    connectors: ['kubernetes', 'docker', 'mqtt', 'opc_ua'],
    metadata: {
      complexity: 'Advanced',
      applications: ['autonomous_vehicles', 'smart_cities', 'industrial_iot'],
    },
  },
  {
    name: 'Digital Twin Architect',
    description: 'Digital twin creation and real-time simulation agent',
    defaultPrompt:
      'You are a digital twin architect. Create and manage digital twins for physical systems and processes.',
    defaultModel: 'gpt-4o',
    category: 'Digital Twin',
    credentials: {
      required: ['iot_sensors', 'simulation_engine', 'real_time_data'],
      optional: ['3d_models', 'historical_data'],
    },
    workflows: {
      twinCreation: {
        steps: [
          'system_modeling',
          'data_integration',
          'simulation_setup',
          'real_time_sync',
        ],
        outputs: [
          'digital_twins',
          'predictive_analytics',
          'optimization_insights',
        ],
      },
    },
    connectors: [
      'ansys',
      'simulink',
      'azure_digital_twins',
      'aws_iot_twinmaker',
    ],
    metadata: {
      complexity: 'Advanced',
      domains: ['manufacturing', 'smart_cities', 'healthcare', 'energy'],
    },
  },
  {
    name: 'Federated Learning Coordinator',
    description: 'Distributed machine learning and privacy-preserving AI agent',
    defaultPrompt:
      'You are a federated learning coordinator. Manage distributed ML training while preserving data privacy.',
    defaultModel: 'gpt-4o',
    category: 'Federated Learning',
    credentials: {
      required: ['distributed_nodes', 'encryption_keys', 'model_aggregation'],
      optional: ['differential_privacy', 'secure_multiparty_computation'],
    },
    workflows: {
      federatedTraining: {
        steps: [
          'node_registration',
          'model_distribution',
          'local_training',
          'secure_aggregation',
        ],
        outputs: ['global_models', 'privacy_metrics', 'performance_reports'],
      },
    },
    connectors: ['tensorflow_federated', 'pytorch_federated', 'openmined'],
    metadata: {
      complexity: 'Advanced',
      privacyTechniques: [
        'differential_privacy',
        'homomorphic_encryption',
        'secure_aggregation',
      ],
    },
  },
  {
    name: 'Autonomous Vehicle Systems Engineer',
    description: 'Self-driving car systems and autonomous navigation agent',
    defaultPrompt:
      'You are an autonomous vehicle systems engineer. Develop self-driving systems and navigation algorithms.',
    defaultModel: 'gpt-4o',
    category: 'Autonomous Vehicles',
    credentials: {
      required: ['sensor_suite', 'control_systems', 'mapping_data'],
      optional: ['simulation_environment', 'test_track_access'],
    },
    workflows: {
      autonomousNavigation: {
        steps: [
          'sensor_fusion',
          'localization',
          'path_planning',
          'motion_control',
        ],
        outputs: ['vehicle_commands', 'safety_checks', 'navigation_data'],
      },
    },
    connectors: ['ros', 'apollo', 'carla', 'lgsvl'],
    metadata: {
      complexity: 'Advanced',
      sensors: ['lidar', 'camera', 'radar', 'gps', 'imu'],
    },
  },
  {
    name: 'Smart City Infrastructure Manager',
    description:
      'Urban infrastructure monitoring and smart city optimization agent',
    defaultPrompt:
      'You are a smart city infrastructure manager. Monitor and optimize urban systems and infrastructure.',
    defaultModel: 'gpt-4o',
    category: 'Smart Cities',
    credentials: {
      required: ['iot_sensors', 'city_data_platform', 'control_systems'],
      optional: ['satellite_data', 'social_media_feeds'],
    },
    workflows: {
      infrastructureManagement: {
        steps: ['data_collection', 'analysis', 'optimization', 'automation'],
        outputs: [
          'efficiency_reports',
          'maintenance_alerts',
          'optimization_plans',
        ],
      },
    },
    connectors: ['siemens_mindsphere', 'ibm_watson_iot', 'cisco_kinetic'],
    metadata: {
      complexity: 'Advanced',
      systems: [
        'traffic_management',
        'energy_grid',
        'waste_management',
        'public_safety',
      ],
    },
  },
  {
    name: 'Healthcare AI Specialist',
    description: 'Medical AI development and healthcare analytics agent',
    defaultPrompt:
      'You are a healthcare AI specialist. Develop AI solutions for medical diagnosis and healthcare optimization.',
    defaultModel: 'gpt-4o',
    category: 'Healthcare',
    credentials: {
      required: ['medical_datasets', 'hipaa_compliance', 'clinical_systems'],
      optional: ['fda_approval', 'clinical_trials_data'],
    },
    workflows: {
      medicalAI: {
        steps: [
          'data_validation',
          'model_development',
          'clinical_validation',
          'regulatory_approval',
        ],
        outputs: [
          'diagnostic_tools',
          'treatment_recommendations',
          'clinical_reports',
        ],
      },
    },
    connectors: ['epic', 'cerner', 'dicom', 'hl7'],
    metadata: {
      complexity: 'Advanced',
      applications: ['medical_imaging', 'drug_discovery', 'patient_monitoring'],
    },
  },
  {
    name: 'Financial Technology Architect',
    description: 'FinTech solutions and financial system integration agent',
    defaultPrompt:
      'You are a FinTech architect. Design and develop financial technology solutions and integrations.',
    defaultModel: 'gpt-4o',
    category: 'FinTech',
    credentials: {
      required: [
        'banking_apis',
        'regulatory_compliance',
        'security_certifications',
      ],
      optional: ['blockchain_platforms', 'ai_trading_systems'],
    },
    workflows: {
      fintechDevelopment: {
        steps: [
          'requirements_analysis',
          'security_design',
          'development',
          'compliance_testing',
        ],
        outputs: [
          'financial_applications',
          'api_integrations',
          'compliance_reports',
        ],
      },
    },
    connectors: ['stripe', 'plaid', 'square', 'paypal'],
    metadata: {
      complexity: 'Advanced',
      domains: ['payments', 'lending', 'investing', 'insurance'],
    },
  },
  {
    name: 'Supply Chain Optimization Engineer',
    description: 'Supply chain analytics and logistics optimization agent',
    defaultPrompt:
      'You are a supply chain optimization engineer. Analyze and optimize supply chain operations and logistics.',
    defaultModel: 'gpt-4o',
    category: 'Supply Chain',
    credentials: {
      required: ['erp_systems', 'logistics_data', 'inventory_management'],
      optional: ['satellite_tracking', 'weather_data'],
    },
    workflows: {
      supplyChainOptimization: {
        steps: [
          'demand_forecasting',
          'inventory_optimization',
          'route_planning',
          'cost_analysis',
        ],
        outputs: ['optimization_plans', 'cost_savings', 'efficiency_metrics'],
      },
    },
    connectors: ['sap', 'oracle', 'salesforce', 'tableau'],
    metadata: {
      complexity: 'Advanced',
      optimizationAreas: [
        'inventory',
        'transportation',
        'warehousing',
        'procurement',
      ],
    },
  },
  {
    name: 'Energy Grid Management Specialist',
    description:
      'Smart grid optimization and renewable energy integration agent',
    defaultPrompt:
      'You are an energy grid management specialist. Optimize power grids and integrate renewable energy sources.',
    defaultModel: 'gpt-4o',
    category: 'Energy',
    credentials: {
      required: ['grid_data', 'renewable_sources', 'demand_response'],
      optional: ['weather_forecasts', 'energy_storage_systems'],
    },
    workflows: {
      gridOptimization: {
        steps: [
          'load_forecasting',
          'generation_optimization',
          'grid_balancing',
          'demand_response',
        ],
        outputs: ['grid_stability', 'energy_efficiency', 'cost_optimization'],
      },
    },
    connectors: ['scada', 'modbus', 'opc_ua', 'iec_61850'],
    metadata: {
      complexity: 'Advanced',
      energySources: ['solar', 'wind', 'hydro', 'battery_storage'],
    },
  },
  {
    name: 'Environmental Monitoring Scientist',
    description: 'Environmental data analysis and climate monitoring agent',
    defaultPrompt:
      'You are an environmental monitoring scientist. Analyze environmental data and monitor climate changes.',
    defaultModel: 'gpt-4o',
    category: 'Environmental',
    credentials: {
      required: ['environmental_sensors', 'satellite_data', 'climate_datasets'],
      optional: ['air_quality_monitors', 'ocean_sensors'],
    },
    workflows: {
      environmentalAnalysis: {
        steps: [
          'data_collection',
          'quality_assurance',
          'trend_analysis',
          'prediction_modeling',
        ],
        outputs: [
          'environmental_reports',
          'climate_predictions',
          'alert_systems',
        ],
      },
    },
    connectors: [
      'nasa_apis',
      'noaa_data',
      'epa_systems',
      'sentinel_satellites',
    ],
    metadata: {
      complexity: 'Advanced',
      monitoringAreas: [
        'air_quality',
        'water_quality',
        'biodiversity',
        'climate_change',
      ],
    },
  },
  {
    name: 'Space Systems Engineer',
    description: 'Satellite systems and space technology development agent',
    defaultPrompt:
      'You are a space systems engineer. Design and manage satellite systems and space technologies.',
    defaultModel: 'gpt-4o',
    category: 'Space',
    credentials: {
      required: ['satellite_telemetry', 'ground_stations', 'orbital_mechanics'],
      optional: ['space_weather_data', 'launch_vehicle_access'],
    },
    workflows: {
      satelliteOperations: {
        steps: [
          'orbit_planning',
          'payload_operations',
          'data_downlink',
          'system_maintenance',
        ],
        outputs: ['satellite_status', 'mission_data', 'operational_reports'],
      },
    },
    connectors: ['stk', 'satellite_toolkit', 'ground_station_networks'],
    metadata: {
      complexity: 'Advanced',
      satelliteTypes: [
        'communication',
        'earth_observation',
        'navigation',
        'scientific',
      ],
    },
  },
  {
    name: 'Quantum Machine Learning Researcher',
    description:
      'Quantum machine learning algorithms and hybrid quantum-classical systems agent',
    defaultPrompt:
      'You are a quantum machine learning researcher. Develop quantum ML algorithms and hybrid systems.',
    defaultModel: 'gpt-4o',
    category: 'Quantum ML',
    credentials: {
      required: ['quantum_simulators', 'ml_frameworks', 'quantum_hardware'],
      optional: ['quantum_datasets', 'research_collaborations'],
    },
    workflows: {
      quantumML: {
        steps: [
          'problem_quantization',
          'quantum_circuit_design',
          'hybrid_training',
          'performance_analysis',
        ],
        outputs: ['quantum_algorithms', 'hybrid_models', 'research_papers'],
      },
    },
    connectors: ['qiskit_machine_learning', 'pennylane', 'tensorflow_quantum'],
    metadata: {
      complexity: 'Advanced',
      applications: [
        'quantum_neural_networks',
        'quantum_kernels',
        'quantum_optimization',
      ],
    },
  },
  {
    name: 'Neuromorphic Computing Specialist',
    description: 'Brain-inspired computing and neuromorphic hardware agent',
    defaultPrompt:
      'You are a neuromorphic computing specialist. Develop brain-inspired computing systems and algorithms.',
    defaultModel: 'gpt-4o',
    category: 'Neuromorphic',
    credentials: {
      required: [
        'neuromorphic_hardware',
        'spiking_neural_networks',
        'brain_data',
      ],
      optional: ['neuromorphic_chips', 'cognitive_architectures'],
    },
    workflows: {
      neuromorphicDevelopment: {
        steps: [
          'neuron_modeling',
          'network_architecture',
          'hardware_mapping',
          'learning_algorithms',
        ],
        outputs: [
          'neuromorphic_systems',
          'cognitive_models',
          'efficiency_metrics',
        ],
      },
    },
    connectors: ['brian', 'nest', 'spinnaker', 'loihi'],
    metadata: {
      complexity: 'Advanced',
      applications: [
        'edge_ai',
        'cognitive_computing',
        'brain_computer_interfaces',
      ],
    },
  },
  {
    name: 'Bioinformatics Data Scientist',
    description: 'Genomic data analysis and biological computing agent',
    defaultPrompt:
      'You are a bioinformatics data scientist. Analyze genomic data and develop biological computing solutions.',
    defaultModel: 'gpt-4o',
    category: 'Bioinformatics',
    credentials: {
      required: [
        'genomic_databases',
        'sequencing_data',
        'biological_databases',
      ],
      optional: ['clinical_data', 'drug_databases'],
    },
    workflows: {
      genomicAnalysis: {
        steps: [
          'sequence_alignment',
          'variant_calling',
          'functional_annotation',
          'pathway_analysis',
        ],
        outputs: ['genomic_variants', 'biological_insights', 'drug_targets'],
      },
    },
    connectors: ['ncbi', 'ensembl', 'uniprot', 'kegg'],
    metadata: {
      complexity: 'Advanced',
      applications: [
        'precision_medicine',
        'drug_discovery',
        'disease_mechanisms',
      ],
    },
  },
  {
    name: 'Digital Forensics Expert',
    description: 'Digital evidence analysis and cybersecurity forensics agent',
    defaultPrompt:
      'You are a digital forensics expert. Analyze digital evidence and conduct cybersecurity investigations.',
    defaultModel: 'gpt-4o',
    category: 'Digital Forensics',
    credentials: {
      required: ['forensic_tools', 'evidence_chain', 'legal_compliance'],
      optional: ['malware_analysis', 'network_forensics'],
    },
    workflows: {
      forensicInvestigation: {
        steps: [
          'evidence_collection',
          'preservation',
          'analysis',
          'documentation',
        ],
        outputs: ['forensic_reports', 'evidence_artifacts', 'legal_documents'],
      },
    },
    connectors: ['autopsy', 'encase', 'ftk', 'volatility'],
    metadata: {
      complexity: 'Advanced',
      evidenceTypes: [
        'disk_forensics',
        'memory_forensics',
        'network_forensics',
        'mobile_forensics',
      ],
    },
  },
  {
    name: 'Game AI Developer',
    description:
      'Game artificial intelligence and procedural content generation agent',
    defaultPrompt:
      'You are a game AI developer. Create intelligent game systems and procedural content generation.',
    defaultModel: 'gpt-4o',
    category: 'Game AI',
    credentials: {
      required: ['game_engine', 'ai_frameworks', 'content_datasets'],
      optional: ['player_analytics', 'multiplayer_networking'],
    },
    workflows: {
      gameAIDevelopment: {
        steps: [
          'behavior_design',
          'pathfinding',
          'decision_trees',
          'content_generation',
        ],
        outputs: ['ai_agents', 'procedural_content', 'game_mechanics'],
      },
    },
    connectors: ['unity', 'unreal_engine', 'godot', 'tensorflow'],
    metadata: {
      complexity: 'Intermediate',
      aiTypes: [
        'npc_behavior',
        'procedural_generation',
        'adaptive_difficulty',
        'player_modeling',
      ],
    },
  },
  {
    name: 'Social Media Analytics Expert',
    description: 'Social media data analysis and trend prediction agent',
    defaultPrompt:
      'You are a social media analytics expert. Analyze social media data and predict trends.',
    defaultModel: 'gpt-4o',
    category: 'Social Analytics',
    credentials: {
      required: ['social_media_apis', 'sentiment_analysis', 'trend_data'],
      optional: ['influencer_data', 'advertising_metrics'],
    },
    workflows: {
      socialAnalytics: {
        steps: [
          'data_collection',
          'sentiment_analysis',
          'trend_identification',
          'prediction_modeling',
        ],
        outputs: ['trend_reports', 'sentiment_analysis', 'engagement_metrics'],
      },
    },
    connectors: [
      'twitter_api',
      'facebook_api',
      'instagram_api',
      'linkedin_api',
    ],
    metadata: {
      complexity: 'Intermediate',
      analyticsAreas: [
        'sentiment_analysis',
        'trend_prediction',
        'influencer_identification',
        'brand_monitoring',
      ],
    },
  },
  {
    name: 'Creative AI Artist',
    description:
      'AI-powered creative content generation and artistic collaboration agent',
    defaultPrompt:
      'You are a creative AI artist. Generate artistic content and collaborate with human artists.',
    defaultModel: 'gpt-4o',
    category: 'Creative AI',
    credentials: {
      required: ['creative_tools', 'art_datasets', 'style_transfer'],
      optional: ['nft_platforms', 'collaboration_tools'],
    },
    workflows: {
      creativeGeneration: {
        steps: [
          'style_analysis',
          'content_generation',
          'refinement',
          'collaboration',
        ],
        outputs: ['artwork', 'music', 'stories', 'designs'],
      },
    },
    connectors: ['midjourney', 'dalle', 'stable_diffusion', 'runway'],
    metadata: {
      complexity: 'Intermediate',
      creativeDomains: [
        'visual_art',
        'music',
        'writing',
        'design',
        'animation',
      ],
    },
  },
  {
    name: 'Educational Technology Specialist',
    description: 'AI-powered education and personalized learning agent',
    defaultPrompt:
      'You are an educational technology specialist. Create personalized learning experiences and educational content.',
    defaultModel: 'gpt-4o',
    category: 'EdTech',
    credentials: {
      required: ['lms_platform', 'student_data', 'educational_content'],
      optional: ['assessment_tools', 'collaboration_platforms'],
    },
    workflows: {
      personalizedLearning: {
        steps: [
          'student_assessment',
          'content_adaptation',
          'progress_tracking',
          'intervention',
        ],
        outputs: ['learning_paths', 'progress_reports', 'recommendations'],
      },
    },
    connectors: ['canvas', 'blackboard', 'moodle', 'google_classroom'],
    metadata: {
      complexity: 'Intermediate',
      learningTypes: [
        'adaptive_learning',
        'gamification',
        'virtual_reality',
        'augmented_reality',
      ],
    },
  },
  {
    name: 'Legal AI Assistant',
    description: 'Legal document analysis and contract review agent',
    defaultPrompt:
      'You are a legal AI assistant. Analyze legal documents and assist with contract review.',
    defaultModel: 'gpt-4o',
    category: 'Legal AI',
    credentials: {
      required: [
        'legal_databases',
        'document_analysis',
        'compliance_frameworks',
      ],
      optional: ['case_law', 'regulatory_updates'],
    },
    workflows: {
      legalAnalysis: {
        steps: [
          'document_review',
          'risk_assessment',
          'compliance_checking',
          'recommendation_generation',
        ],
        outputs: ['legal_summaries', 'risk_reports', 'compliance_alerts'],
      },
    },
    connectors: ['westlaw', 'lexisnexis', 'contract_analysis_tools'],
    metadata: {
      complexity: 'Advanced',
      legalAreas: [
        'contract_law',
        'compliance',
        'intellectual_property',
        'employment_law',
      ],
    },
  },
];

export async function seedSophisticatedAgents(prisma) {
  console.log('🌱 Seeding sophisticated agents...');

  for (const agent of sophisticatedAgents) {
    try {
      await prisma.agentTemplate.upsert({
        where: { name: agent.name },
        update: agent,
        create: agent,
      });
      console.log(`✅ Created/updated sophisticated agent: ${agent.name}`);
    } catch (error) {
      console.error(
        `❌ Error creating sophisticated agent ${agent.name}:`,
        error
      );
    }
  }
  console.log('🎉 Sophisticated agents seeding completed!');
}
