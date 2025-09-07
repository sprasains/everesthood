# 📐 EverestHood Architecture & Diagrams

## System Architecture

```mermaid
graph TB
    Client[Client Browser] --> Next[Next.js App Router]
    Next --> API[API Routes]
    Next --> Pages[Pages]
    Next --> Components[Components]
    
    API --> Auth[Auth Service]
    API --> DB[Database]
    API --> Cache[Redis Cache]
    API --> Queue[Job Queue]
    
    Auth --> NextAuth[NextAuth.js]
    NextAuth --> OAuth[OAuth Providers]
    
    DB --> Prisma[Prisma ORM]
    Prisma --> Postgres[PostgreSQL]
    
    Cache --> Redis[Redis]
    Queue --> BullMQ[BullMQ]
    BullMQ --> Redis
```

## Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Auth
    participant Cache
    participant DB
    participant Queue

    Client->>Server: Request Data
    Server->>Auth: Verify Session
    Auth-->>Server: Session Valid
    Server->>Cache: Check Cache
    
    alt Cache Hit
        Cache-->>Server: Return Cached Data
    else Cache Miss
        Server->>DB: Query Data
        DB-->>Server: Return Data
        Server->>Cache: Store in Cache
    end
    
    Server-->>Client: Send Response
    Server->>Queue: Enqueue Background Job
```

## Component Architecture

```mermaid
graph TB
    Layout[Root Layout] --> Nav[Navigation]
    Layout --> Main[Main Content]
    Layout --> Footer[Footer]
    
    Nav --> Search[Search]
    Nav --> UserMenu[User Menu]
    Nav --> Notifications[Notifications]
    
    Main --> Feed[Feed]
    Feed --> Post[Post Card]
    Feed --> Event[Event Card]
    Feed --> Poll[Poll Card]
    
    Post --> Like[Like Button]
    Post --> Comment[Comment Section]
    Post --> Share[Share Button]
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant NextAuth
    participant OAuth
    participant DB

    User->>App: Click Sign In
    App->>NextAuth: Initiate Auth
    NextAuth->>OAuth: Redirect to Provider
    OAuth-->>User: Show Consent Screen
    User->>OAuth: Grant Permission
    OAuth-->>NextAuth: Auth Code
    NextAuth->>OAuth: Exchange Code
    OAuth-->>NextAuth: Access Token
    NextAuth->>DB: Create/Update User
    NextAuth-->>App: Set Session
    App-->>User: Redirect to App
```

## Database Schema

```mermaid
erDiagram
    User ||--o{ Post : creates
    User ||--o{ Comment : writes
    User ||--o{ Like : gives
    User ||--o{ Event : organizes
    User ||--o{ Poll : creates
    User ||--o{ EventAttendee : attends
    User ||--o{ PollVote : votes
    
    Post {
        string id PK
        string title
        string content
        datetime createdAt
        string authorId FK
    }
    
    Event {
        string id PK
        string title
        string description
        datetime startTime
        datetime endTime
        string location
        string organizerId FK
    }
    
    Poll {
        string id PK
        string question
        datetime endDate
        string creatorId FK
    }
    
    Comment {
        string id PK
        string content
        string postId FK
        string authorId FK
    }
    
    Like {
        string postId PK
        string userId PK
    }
    
    EventAttendee {
        string eventId PK
        string userId PK
        string status
    }
```

## State Management

```mermaid
graph TB
    GlobalState[Global State] --> Auth[Auth State]
    GlobalState --> UI[UI State]
    GlobalState --> Cache[Cache State]
    
    Auth --> Session[Session Info]
    Auth --> Permissions[User Permissions]
    
    UI --> Theme[Theme Settings]
    UI --> Notifications[Notification State]
    UI --> Modal[Modal State]
    
    Cache --> QueryCache[React Query Cache]
    Cache --> LocalStorage[Local Storage]
```

## Deployment Architecture

```mermaid
graph TB
    Git[GitHub] --> Actions[GitHub Actions]
    Actions --> Build[Build Process]
    Build --> Test[Run Tests]
    Test --> Deploy[Deploy]
    
    Deploy --> Vercel[Vercel]
    Deploy --> AWS[AWS Resources]
    
    Vercel --> Edge[Edge Network]
    AWS --> S3[S3 Storage]
    AWS --> RDS[PostgreSQL RDS]
    AWS --> ElastiCache[Redis Cache]
```

## Queue System

```mermaid
graph TB
    Producer[Job Producer] --> Queue[Redis Queue]
    Queue --> Workers[Job Workers]
    Workers --> DLQ[Dead Letter Queue]
    
    subgraph Workers
        Worker1[Worker 1]
        Worker2[Worker 2]
        Worker3[Worker 3]
    end
    
    Workers --> Notifications[Send Notifications]
    Workers --> Emails[Send Emails]
    Workers --> Processing[Process Data]
```

## Search Architecture

```mermaid
graph TB
    SearchInput[Search Input] --> Debounce[Debounce]
    Debounce --> API[Search API]
    
    API --> Posts[Search Posts]
    API --> Events[Search Events]
    API --> Users[Search Users]
    API --> Polls[Search Polls]
    
    Posts --> Results[Combine Results]
    Events --> Results
    Users --> Results
    Polls --> Results
    
    Results --> Cache[Cache Results]
    Results --> Display[Display Results]
```

## Error Handling Flow

```mermaid
graph TB
    Error[Error Occurs] --> Type[Determine Type]
    
    Type --> API[API Error]
    Type --> Auth[Auth Error]
    Type --> Validation[Validation Error]
    
    API --> APIHandler[API Error Handler]
    Auth --> AuthHandler[Auth Error Handler]
    Validation --> ValidationHandler[Validation Handler]
    
    APIHandler --> Retry[Retry Logic]
    APIHandler --> Fallback[Fallback UI]
    
    AuthHandler --> Redirect[Auth Redirect]
    ValidationHandler --> Form[Form Feedback]
```

These diagrams provide visual representations of:
1. Overall system architecture
2. Data flow between components
3. Component hierarchy
4. Authentication process
5. Database relationships
6. State management
7. Deployment pipeline
8. Queue system
9. Search functionality
10. Error handling

Would you like me to:
1. Add more specific technical diagrams?
2. Create workflow diagrams for specific features?
3. Add sequence diagrams for complex operations?
4. Create visual guides for the development process?
