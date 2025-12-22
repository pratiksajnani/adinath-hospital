/**
 * Backup Export Edge Function
 * Exports hospital data to Supabase Storage for disaster recovery
 *
 * Schedule: Run weekly via cron job or GitHub Actions
 * Storage: supabase-storage://backups/
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupResult {
  success: boolean;
  timestamp: string;
  tables: Record<string, number>;
  storagePath?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'pratik.sajnani@gmail.com';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = new Date().toISOString().split('T')[0];
    const backupData: Record<string, unknown[]> = {};
    const tableCounts: Record<string, number> = {};

    console.log(`[Backup] Starting backup for ${timestamp}`);

    // Tables to backup
    const tables = [
      'patients',
      'appointments',
      'prescriptions',
      'doctors',
      'staff',
      'inventory',
      'sales',
      'feedback',
    ];

    // Export each table
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn(`[Backup] Error exporting ${table}:`, error.message);
          backupData[table] = [];
          tableCounts[table] = 0;
        } else {
          // Anonymize sensitive patient data
          if (table === 'patients') {
            backupData[table] = (data || []).map((p: Record<string, unknown>) => ({
              ...p,
              phone: p.phone ? `***${String(p.phone).slice(-4)}` : null,
              address: p.address ? '[REDACTED]' : null,
              email: p.email ? `***@${String(p.email).split('@')[1]}` : null,
            }));
          } else {
            backupData[table] = data || [];
          }
          tableCounts[table] = (data || []).length;
        }

        console.log(`[Backup] Exported ${tableCounts[table]} records from ${table}`);
      } catch (err) {
        console.error(`[Backup] Failed to export ${table}:`, err);
        backupData[table] = [];
        tableCounts[table] = 0;
      }
    }

    // Create backup JSON
    const backupJson = JSON.stringify(
      {
        version: '1.0',
        timestamp: new Date().toISOString(),
        hospital: 'Adinath Hospital',
        tables: tableCounts,
        data: backupData,
      },
      null,
      2
    );

    // Upload to Supabase Storage
    const fileName = `backup-${timestamp}.json`;
    const storagePath = `backups/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hospital-backups')
      .upload(storagePath, new Blob([backupJson], { type: 'application/json' }), {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Backup] Upload failed:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log(`[Backup] Uploaded to ${storagePath}`);

    // Clean up old backups (keep last 4 weeks)
    await cleanupOldBackups(supabase, 4);

    // Send notification email
    await sendNotification(supabase, adminEmail, {
      success: true,
      timestamp,
      tableCounts,
      storagePath,
    });

    const result: BackupResult = {
      success: true,
      timestamp: new Date().toISOString(),
      tables: tableCounts,
      storagePath,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Backup] Error:', error);

    const result: BackupResult = {
      success: false,
      timestamp: new Date().toISOString(),
      tables: {},
      error: error.message,
    };

    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Clean up old backups, keeping only the specified number
 */
async function cleanupOldBackups(
  supabase: ReturnType<typeof createClient>,
  keepCount: number
): Promise<void> {
  try {
    const { data: files, error } = await supabase.storage
      .from('hospital-backups')
      .list('backups', {
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !files) {
      console.warn('[Backup] Could not list backups for cleanup');
      return;
    }

    // Remove old files beyond keepCount
    const filesToDelete = files.slice(keepCount);

    for (const file of filesToDelete) {
      const { error: deleteError } = await supabase.storage
        .from('hospital-backups')
        .remove([`backups/${file.name}`]);

      if (deleteError) {
        console.warn(`[Backup] Could not delete ${file.name}:`, deleteError);
      } else {
        console.log(`[Backup] Deleted old backup: ${file.name}`);
      }
    }
  } catch (err) {
    console.error('[Backup] Cleanup error:', err);
  }
}

/**
 * Send notification about backup status
 */
async function sendNotification(
  supabase: ReturnType<typeof createClient>,
  email: string,
  backup: {
    success: boolean;
    timestamp: string;
    tableCounts: Record<string, number>;
    storagePath?: string;
    error?: string;
  }
): Promise<void> {
  try {
    // Calculate total records
    const totalRecords = Object.values(backup.tableCounts).reduce((a, b) => a + b, 0);

    const subject = backup.success
      ? `✅ Adinath Hospital Backup Complete - ${backup.timestamp}`
      : `❌ Adinath Hospital Backup Failed - ${backup.timestamp}`;

    const tableRows = Object.entries(backup.tableCounts)
      .map(([table, count]) => `<tr><td>${table}</td><td>${count}</td></tr>`)
      .join('');

    const html = `
      <h2>${backup.success ? '✅ Backup Successful' : '❌ Backup Failed'}</h2>
      <p><strong>Date:</strong> ${backup.timestamp}</p>
      ${backup.storagePath ? `<p><strong>Location:</strong> ${backup.storagePath}</p>` : ''}
      ${backup.error ? `<p><strong>Error:</strong> ${backup.error}</p>` : ''}
      
      <h3>Data Summary</h3>
      <table border="1" cellpadding="8">
        <tr><th>Table</th><th>Records</th></tr>
        ${tableRows}
        <tr><th>Total</th><th>${totalRecords}</th></tr>
      </table>
      
      <p style="margin-top: 20px; color: #666;">
        This is an automated backup notification from Adinath Hospital Management System.
      </p>
    `;

    // Use Supabase Edge Function to send email (requires email integration)
    // For now, log the notification
    console.log(`[Backup] Would send notification to ${email}: ${subject}`);

    // If you have Resend or SendGrid configured:
    // await supabase.functions.invoke('send-email', {
    //   body: { to: email, subject, html }
    // });
  } catch (err) {
    console.error('[Backup] Notification error:', err);
  }
}

