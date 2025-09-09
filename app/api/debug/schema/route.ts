import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface TableInfo {
  table_name: string;
  table_type: string;
  table_rows?: number;
  table_size?: string;
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
  ordinal_position: number;
}

interface ForeignKeyInfo {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  constraint_name: string;
}

interface IndexInfo {
  table_name: string;
  index_name: string;
  column_name: string;
  is_unique: boolean;
  is_primary: boolean;
}

interface SchemaInfo {
  tables: TableInfo[];
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
  constraints: any[];
  statistics: any;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const includeStats = searchParams.get('includeStats') === 'true';
  
  try {
    if (table) {
      // Get detailed info for a specific table
      const tableInfo = await getTableDetails(table, includeStats);
      return NextResponse.json({
        table,
        info: tableInfo,
        timestamp: new Date().toISOString()
      });
    } else {
      // Get full schema information
      const schema = await getFullSchema(includeStats);
      return NextResponse.json({
        schema,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      table,
      includeStats,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getFullSchema(includeStats: boolean = false): Promise<SchemaInfo> {
  try {
    // Get table information
    const tables = await prisma.$queryRaw<TableInfo[]>`
      SELECT 
        t.table_name,
        t.table_type,
        CASE 
          WHEN t.table_type = 'BASE TABLE' THEN 
            (SELECT n_tup_ins + n_tup_upd + n_tup_del 
             FROM pg_stat_user_tables s 
             WHERE s.relname = t.table_name)
          ELSE NULL
        END as table_rows,
        CASE 
          WHEN t.table_type = 'BASE TABLE' THEN 
            pg_size_pretty(pg_total_relation_size(t.table_name::regclass))
          ELSE NULL
        END as table_size
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `;

    // Get column information
    const columns = await prisma.$queryRaw<ColumnInfo[]>`
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        c.ordinal_position
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
      ORDER BY c.table_name, c.ordinal_position
    `;

    // Get foreign key relationships
    const foreignKeys = await prisma.$queryRaw<ForeignKeyInfo[]>`
      SELECT 
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `;

    // Get index information
    const indexes = await prisma.$queryRaw<IndexInfo[]>`
      SELECT 
        t.relname as table_name,
        i.relname as index_name,
        a.attname as column_name,
        i.indisunique as is_unique,
        i.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
        AND t.relname NOT LIKE 'pg_%'
        AND t.relname NOT LIKE '_prisma_%'
      ORDER BY t.relname, i.relname, a.attnum
    `;

    // Get constraint information
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name
    `;

    // Get database statistics if requested
    let statistics = null;
    if (includeStats) {
      statistics = await getDatabaseStatistics();
    }

    return {
      tables,
      columns,
      foreignKeys,
      indexes,
      constraints,
      statistics
    };
  } catch (error) {
    console.error('Error getting schema:', error);
    throw error;
  }
}

async function getTableDetails(tableName: string, includeStats: boolean = false) {
  try {
    // Get table structure
    const columns = await prisma.$queryRaw<ColumnInfo[]>`
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        c.character_maximum_length,
        c.numeric_precision,
        c.numeric_scale,
        c.ordinal_position
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = ${tableName}
      ORDER BY c.ordinal_position
    `;

    // Get constraints for this table
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
      ORDER BY tc.constraint_name
    `;

    // Get indexes for this table
    const indexes = await prisma.$queryRaw<IndexInfo[]>`
      SELECT 
        i.relname as index_name,
        a.attname as column_name,
        i.indisunique as is_unique,
        i.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
        AND t.relname = ${tableName}
      ORDER BY i.relname, a.attnum
    `;

    // Get table statistics if requested
    let statistics = null;
    if (includeStats) {
      statistics = await getTableStatistics(tableName);
    }

    // Get sample data (first 5 rows)
    const sampleData = await getSampleData(tableName);

    return {
      columns,
      constraints,
      indexes,
      statistics,
      sampleData
    };
  } catch (error) {
    console.error(`Error getting table details for ${tableName}:`, error);
    throw error;
  }
}

async function getDatabaseStatistics() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation,
        most_common_vals,
        most_common_freqs
      FROM pg_stats
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
    `;

    const indexStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
    `;

    const tableStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        relname as tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_tup_ins,
        n_tup_upd,
        n_tup_del
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY seq_scan DESC
    `;

    return {
      columnStats: stats,
      indexStats,
      tableStats
    };
  } catch (error) {
    console.error('Error getting database statistics:', error);
    return null;
  }
}

async function getTableStatistics(tableName: string) {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        attname,
        n_distinct,
        correlation,
        most_common_vals,
        most_common_freqs
      FROM pg_stats
      WHERE schemaname = 'public'
        AND tablename = ${tableName}
      ORDER BY attname
    `;

    const indexStats = await prisma.$queryRaw`
      SELECT 
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
        AND tablename = ${tableName}
      ORDER BY idx_scan DESC
    `;

    const tableStats = await prisma.$queryRaw`
      SELECT 
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_live_tup,
        n_dead_tup
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
        AND relname = ${tableName}
    `;

    return {
      columnStats: stats,
      indexStats,
      tableStats: tableStats[0] || null
    };
  } catch (error) {
    console.error(`Error getting table statistics for ${tableName}:`, error);
    return null;
  }
}

async function getSampleData(tableName: string) {
  try {
    // Get sample data using dynamic query
    const result = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" LIMIT 5`);
    return result;
  } catch (error) {
    console.error(`Error getting sample data for ${tableName}:`, error);
    return null;
  }
}
