import { Card, Col, Row, Flex, Switch, Slider, Select, Input, Button, Tabs, Tag, Divider, InputNumber, Radio, Collapse, ColorPicker } from "antd";
import type { TabsProps, CollapseProps } from "antd";
import {
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  MailOutlined,
  ApiOutlined,
  SaveOutlined,
  ReloadOutlined,
  LockOutlined,
  GlobalOutlined,
  SoundOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { BiCog, BiShield, BiBell, BiCloud, BiMicrophone, BiBot } from "react-icons/bi";
import { FiCpu, FiDatabase, FiLayers, FiZap } from "react-icons/fi";
import { MdOutlineSpeed, MdOutlineAutoGraph } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";

import "./configuration.scss";

const Configuration = () => {
  // General Settings Panel
  const generalSettings = (
    <div className="settings-panel">
      <div className="settings-group">
        <h4 className="settings-group__title">
          <GlobalOutlined /> General
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Company Name</div>
            <div className="settings-item__desc">Your organization's display name</div>
          </div>
          <Input placeholder="Acme Corp" style={{ width: 280 }} defaultValue="Ovozly Inc." />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Time Zone</div>
            <div className="settings-item__desc">Set your default time zone</div>
          </div>
          <Select
            defaultValue="utc-5"
            style={{ width: 280 }}
            options={[
              { value: "utc-8", label: "(UTC-08:00) Pacific Time" },
              { value: "utc-5", label: "(UTC-05:00) Eastern Time" },
              { value: "utc", label: "(UTC+00:00) London" },
              { value: "utc+1", label: "(UTC+01:00) Paris" },
            ]}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Language</div>
            <div className="settings-item__desc">Default language for the platform</div>
          </div>
          <Select
            defaultValue="en"
            style={{ width: 280 }}
            options={[
              { value: "en", label: "English" },
              { value: "es", label: "Spanish" },
              { value: "fr", label: "French" },
              { value: "de", label: "German" },
            ]}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Date Format</div>
            <div className="settings-item__desc">Choose your preferred date format</div>
          </div>
          <Radio.Group defaultValue="mdy">
            <Radio.Button value="mdy">MM/DD/YYYY</Radio.Button>
            <Radio.Button value="dmy">DD/MM/YYYY</Radio.Button>
            <Radio.Button value="ymd">YYYY-MM-DD</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <Divider />

      <div className="settings-group">
        <h4 className="settings-group__title">
          <EyeOutlined /> Display
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Dark Mode</div>
            <div className="settings-item__desc">Enable dark theme across the platform</div>
          </div>
          <Switch />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Accent Color</div>
            <div className="settings-item__desc">Customize your brand color</div>
          </div>
          <ColorPicker defaultValue="#1890ff" showText />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Compact Mode</div>
            <div className="settings-item__desc">Reduce spacing for more content</div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );

  // AI & Processing Settings
  const aiSettings = (
    <div className="settings-panel">
      <div className="settings-group">
        <h4 className="settings-group__title">
          <RobotOutlined /> AI Models
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Transcription Model</div>
            <div className="settings-item__desc">Select the speech-to-text engine</div>
          </div>
          <Select
            defaultValue="whisper-large"
            style={{ width: 280 }}
            options={[
              { value: "whisper-large", label: "Whisper Large v3 (Best)" },
              { value: "whisper-medium", label: "Whisper Medium (Balanced)" },
              { value: "whisper-small", label: "Whisper Small (Fast)" },
              { value: "deepgram", label: "Deepgram Nova" },
            ]}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Sentiment Model</div>
            <div className="settings-item__desc">Choose sentiment analysis engine</div>
          </div>
          <Select
            defaultValue="custom-v2"
            style={{ width: 280 }}
            options={[
              { value: "custom-v2", label: "Custom Trained v2" },
              { value: "gpt4", label: "GPT-4 Analysis" },
              { value: "bert", label: "BERT Sentiment" },
            ]}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Auto-enhance Transcripts</div>
            <div className="settings-item__desc">Use AI to improve transcript quality</div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Divider />

      <div className="settings-group">
        <h4 className="settings-group__title">
          <FiCpu /> Processing
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Processing Priority</div>
            <div className="settings-item__desc">Balance between speed and accuracy</div>
          </div>
          <div style={{ width: 280 }}>
            <Slider
              marks={{ 0: "Speed", 50: "Balanced", 100: "Quality" }}
              defaultValue={50}
              tooltip={{ formatter: (val) => `${val}%` }}
            />
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Parallel Workers</div>
            <div className="settings-item__desc">Maximum concurrent processing jobs</div>
          </div>
          <InputNumber min={1} max={32} defaultValue={8} style={{ width: 120 }} addonAfter="workers" />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Auto-retry Failed Jobs</div>
            <div className="settings-item__desc">Automatically retry failed processing</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Retry Attempts</div>
            <div className="settings-item__desc">Number of retry attempts</div>
          </div>
          <InputNumber min={1} max={5} defaultValue={3} style={{ width: 120 }} />
        </div>
      </div>
    </div>
  );

  // Notifications Settings
  const notificationSettings = (
    <div className="settings-panel">
      <div className="settings-group">
        <h4 className="settings-group__title">
          <MailOutlined /> Email Notifications
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Daily Digest</div>
            <div className="settings-item__desc">Receive daily summary of activities</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Critical Alerts</div>
            <div className="settings-item__desc">Get notified on system issues</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Processing Complete</div>
            <div className="settings-item__desc">Notify when batches finish</div>
          </div>
          <Switch />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Notification Email</div>
            <div className="settings-item__desc">Email address for notifications</div>
          </div>
          <Input placeholder="admin@company.com" style={{ width: 280 }} defaultValue="admin@ovozly.com" />
        </div>
      </div>

      <Divider />

      <div className="settings-group">
        <h4 className="settings-group__title">
          <BellOutlined /> In-app Notifications
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Desktop Notifications</div>
            <div className="settings-item__desc">Show browser notifications</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Sound Alerts</div>
            <div className="settings-item__desc">Play sounds for notifications</div>
          </div>
          <Switch />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Badge Counter</div>
            <div className="settings-item__desc">Show unread count in browser tab</div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );

  // Security Settings
  const securitySettings = (
    <div className="settings-panel">
      <div className="settings-group">
        <h4 className="settings-group__title">
          <LockOutlined /> Authentication
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Two-Factor Authentication</div>
            <div className="settings-item__desc">Require 2FA for all users</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">SSO Provider</div>
            <div className="settings-item__desc">Single sign-on configuration</div>
          </div>
          <Select
            defaultValue="none"
            style={{ width: 280 }}
            options={[
              { value: "none", label: "Disabled" },
              { value: "okta", label: "Okta" },
              { value: "azure", label: "Azure AD" },
              { value: "google", label: "Google Workspace" },
            ]}
          />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Session Timeout</div>
            <div className="settings-item__desc">Auto-logout after inactivity</div>
          </div>
          <Select
            defaultValue="60"
            style={{ width: 280 }}
            options={[
              { value: "15", label: "15 minutes" },
              { value: "30", label: "30 minutes" },
              { value: "60", label: "1 hour" },
              { value: "480", label: "8 hours" },
            ]}
          />
        </div>
      </div>

      <Divider />

      <div className="settings-group">
        <h4 className="settings-group__title">
          <SecurityScanOutlined /> Data Security
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Data Encryption</div>
            <div className="settings-item__desc">Encrypt data at rest</div>
          </div>
          <Tag color="green">Enabled (AES-256)</Tag>
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">PII Redaction</div>
            <div className="settings-item__desc">Auto-redact sensitive information</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Audit Logging</div>
            <div className="settings-item__desc">Track all user actions</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Data Retention</div>
            <div className="settings-item__desc">How long to keep call recordings</div>
          </div>
          <Select
            defaultValue="365"
            style={{ width: 280 }}
            options={[
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
              { value: "180", label: "6 months" },
              { value: "365", label: "1 year" },
              { value: "forever", label: "Forever" },
            ]}
          />
        </div>
      </div>
    </div>
  );

  // API Settings
  const apiSettings = (
    <div className="settings-panel">
      <div className="settings-group">
        <h4 className="settings-group__title">
          <ApiOutlined /> API Configuration
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">API Key</div>
            <div className="settings-item__desc">Your API authentication key</div>
          </div>
          <Flex gap={8}>
            <Input.Password
              style={{ width: 280 }}
              defaultValue="sk-xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              visibilityToggle
            />
            <Button icon={<ReloadOutlined />}>Regenerate</Button>
          </Flex>
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Webhook URL</div>
            <div className="settings-item__desc">Endpoint for event notifications</div>
          </div>
          <Input placeholder="https://your-server.com/webhook" style={{ width: 400 }} />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Rate Limit</div>
            <div className="settings-item__desc">Maximum API calls per minute</div>
          </div>
          <InputNumber min={10} max={10000} defaultValue={1000} style={{ width: 150 }} addonAfter="/min" />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Enable API Access</div>
            <div className="settings-item__desc">Allow external API connections</div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Divider />

      <div className="settings-group">
        <h4 className="settings-group__title">
          <BranchesOutlined /> Webhooks
        </h4>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Call Completed</div>
            <div className="settings-item__desc">Trigger when call processing ends</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Evaluation Complete</div>
            <div className="settings-item__desc">Trigger when evaluation finishes</div>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="settings-item">
          <div className="settings-item__info">
            <div className="settings-item__label">Critical Alert</div>
            <div className="settings-item__desc">Trigger on system alerts</div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );

  const tabItems: TabsProps["items"] = [
    {
      key: "general",
      label: (
        <span>
          <SettingOutlined /> General
        </span>
      ),
      children: generalSettings,
    },
    {
      key: "ai",
      label: (
        <span>
          <RobotOutlined /> AI & Processing
        </span>
      ),
      children: aiSettings,
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined /> Notifications
        </span>
      ),
      children: notificationSettings,
    },
    {
      key: "security",
      label: (
        <span>
          <SecurityScanOutlined /> Security
        </span>
      ),
      children: securitySettings,
    },
    {
      key: "api",
      label: (
        <span>
          <ApiOutlined /> API & Webhooks
        </span>
      ),
      children: apiSettings,
    },
  ];

  return (
    <div className="configuration-page">
      <Card className="config-card">
        <Flex justify="space-between" align="center" className="config-header">
          <div>
            <h2 className="config-title">
              <SettingOutlined /> Configuration
            </h2>
            <p className="config-subtitle">Manage your platform settings and preferences</p>
          </div>
          <Flex gap={12}>
            <Button icon={<ReloadOutlined />}>Reset to Defaults</Button>
            <Button type="primary" icon={<SaveOutlined />}>
              Save Changes
            </Button>
          </Flex>
        </Flex>

        <Divider />

        <Tabs defaultActiveKey="general" items={tabItems} tabPosition="left" className="config-tabs" />
      </Card>
    </div>
  );
};

export default Configuration;
