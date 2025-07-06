CREATE OR REPLACE FUNCTION notify_on_error_threshold()
RETURNS trigger AS $$
DECLARE
  error_count INT;
  total_count INT;
  error_rate FLOAT;
  webhook_url TEXT;
BEGIN
  SELECT value INTO webhook_url FROM settings WHERE key = 'alert_webhook_url';
  SELECT COUNT(*) INTO error_count FROM execution_logs
    WHERE status = 'ERROR' AND created_at > NOW() - INTERVAL '5 minutes';
  SELECT COUNT(*) INTO total_count FROM execution_logs
    WHERE created_at > NOW() - INTERVAL '5 minutes';
  IF total_count > 0 THEN
    error_rate := error_count::FLOAT / total_count;
    IF error_rate > 0.1 THEN
      PERFORM http_post(webhook_url, json_build_object('error_rate', error_rate));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER execution_log_alert
AFTER INSERT ON execution_logs
FOR EACH ROW EXECUTE FUNCTION notify_on_error_threshold(); 