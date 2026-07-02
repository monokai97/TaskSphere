import { z } from 'zod'

export const CreateTaskInput = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(500).transform((s) => s.trim()),
  description: z.string().max(5000).optional(),
  list: z.number().int().positive().optional(),
  dueDate: z.string().datetime().optional(),
  important: z.boolean().default(false),
  reminderMinutesBefore: z.number().int().positive().optional(),
  repeatType: z.enum(['none', 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly']).default('none'),
  repeatInterval: z.number().int().min(1).default(1),
  repeatEndDate: z.string().datetime().optional(),
  repeatCount: z.number().int().min(1).optional(),
  categories: z.array(z.number().int().positive()).optional(),
})

export const UpdateTaskInput = z.object({
  title: z.string().min(3).max(500).transform((s) => s.trim()).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(['pending', 'completed']).optional(),
  important: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  reminderMinutesBefore: z.number().int().positive().nullable().optional(),
  repeatType: z.enum(['none', 'daily', 'weekdays', 'weekly', 'biweekly', 'monthly', 'yearly']).optional(),
  repeatInterval: z.number().int().min(1).optional(),
  repeatEndDate: z.string().datetime().nullable().optional(),
  repeatCount: z.number().int().min(1).nullable().optional(),
  categories: z.array(z.number().int().positive()).optional(),
})

export const CreateCategoryInput = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()),
  color: z.string().optional(),
  icon: z.string().optional(),
})

export const UpdateCategoryInput = z.object({
  name: z.string().min(1).max(100).transform((s) => s.trim()).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const CreateProfileInput = z.object({
  fullName: z.string().min(1).max(200).transform((s) => s.trim()),
  email: z.string().email().optional().or(z.literal('')),
  bio: z.string().max(160).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  role: z.enum(['designer', 'admin', 'manager', 'viewer']).optional(),
  defaultListVisibility: z.enum(['private', 'shared']).optional(),
  allowAccessRequests: z.boolean().optional(),
  showActivityInSharedLists: z.boolean().optional(),
})

export const UpdateProfileInput = z.object({
  fullName: z.string().min(1).max(200).transform((s) => s.trim()).optional(),
  email: z.string().email().optional().or(z.literal('')).optional(),
  bio: z.string().max(160).optional(),
  avatar: z.string().url().optional().or(z.literal('')).optional(),
  role: z.enum(['designer', 'admin', 'manager', 'viewer']).optional(),
  defaultListVisibility: z.enum(['private', 'shared']).optional(),
  allowAccessRequests: z.boolean().optional(),
  showActivityInSharedLists: z.boolean().optional(),
})

export const ChangePasswordInput = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export const DesktopAlertPreferences = z.object({
  masterOn: z.boolean(),
  triggers: z.object({
    taskReminders: z.boolean(),
    sharedList: z.boolean(),
    dueDate: z.boolean(),
    systemUpdates: z.boolean(),
  }),
  sound: z.string().max(100),
  alertStyle: z.enum(['banner', 'alert']),
})

export const EmailSummaryPreferences = z.object({
  deliveryEmail: z.string().email().optional().or(z.literal('')),
  dailyBrief: z.boolean(),
  weeklyReport: z.boolean(),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly']),
  contentTypes: z.object({
    completedTasks: z.boolean(),
    overdueReminders: z.boolean(),
    upcomingDeadlines: z.boolean(),
    focusStatistics: z.boolean(),
  }),
})

export const PushNotificationPreferences = z.object({
  deviceEnabled: z.object({
    iphone: z.boolean(),
    macbook: z.boolean(),
  }),
  alertTypes: z.object({
    taskReminders: z.boolean(),
    dueDateAlerts: z.boolean(),
    sharedListActivity: z.boolean(),
    focusSession: z.boolean(),
  }),
  dndFrom: z.string().regex(/^\d{2}:\d{2}$/),
  dndTo: z.string().regex(/^\d{2}:\d{2}$/),
  quietDays: z.array(z.number().int().min(0).max(6)),
})

export const DateTimePreferences = z.object({
  autoDetect: z.boolean(),
  dateFormat: z.enum(['ddmmyyyy', 'mmddyyyy', 'yyyymmdd', 'long']),
  timeFormat: z.enum(['24h', '12h']),
  firstDayOfWeek: z.enum(['monday', 'sunday', 'saturday']),
  timezone: z.string(),
  timezoneAutoDetect: z.boolean(),
})

export const GoogleCalendarIntegration = z.object({
  importEvents: z.boolean(),
  syncCompleted: z.boolean(),
  primaryCalendar: z.string(),
  syncFrequency: z.string(),
})

export const OutlookCalendarIntegration = z.object({
  importEvents: z.boolean(),
  syncCompleted: z.boolean(),
  primaryCalendar: z.string(),
  syncFrequency: z.string(),
})

export const ICalIntegration = z.object({
  url: z.string(),
  importEvents: z.boolean(),
  autoRefresh: z.boolean(),
  syncFrequency: z.string(),
})

export const SlackIntegration = z.object({
  syncStatus: z.boolean(),
  taskNotifications: z.boolean(),
  channel: z.string(),
})

export const MicrosoftTeamsIntegration = z.object({
  presenceSync: z.boolean(),
  activityFeed: z.boolean(),
  channel: z.string(),
})

export const ZapierIntegration = z.object({
  newTaskWebhook: z.boolean(),
  taskCompletedWebhook: z.boolean(),
})

export const GitHubIntegration = z.object({
  importIssues: z.boolean(),
  syncPRReviews: z.boolean(),
  updateOnCommit: z.boolean(),
})

export const BackgroundPreferences = z.object({
  mode: z.enum(['solid', 'gradient', 'texture', 'image']),
  blur: z.number().int().min(0).max(40),
  opacity: z.number().int().min(0).max(100),
})

export const Integrations = z.object({
  googleCalendar: GoogleCalendarIntegration.optional(),
  outlookCalendar: OutlookCalendarIntegration.optional(),
  ical: ICalIntegration.optional(),
  slack: SlackIntegration.optional(),
  microsoftTeams: MicrosoftTeamsIntegration.optional(),
  zapier: ZapierIntegration.optional(),
  github: GitHubIntegration.optional(),
})

export const UpdateSessionInput = z.object({
  desktopAlertPreferences: DesktopAlertPreferences.optional(),
  emailSummaryPreferences: EmailSummaryPreferences.optional(),
  pushNotificationPreferences: PushNotificationPreferences.optional(),
  dateTimePreferences: DateTimePreferences.optional(),
  backgroundPreferences: BackgroundPreferences.optional(),
  integrations: Integrations.optional(),
  locale: z.enum(['en', 'es', 'fr', 'de', 'pt', 'it']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  accent: z.string().optional(),
  density: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
})

export const VerifyTwoFactorInput = z.object({
  token: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
})

export const TwoFactorSetupResponse = z.object({
  secret: z.string(),
  uri: z.string().url(),
  backupCodes: z.array(z.string()),
})

export type CreateTaskInput = z.infer<typeof CreateTaskInput>
export type UpdateTaskInput = z.infer<typeof UpdateTaskInput>
export type CreateCategoryInput = z.infer<typeof CreateCategoryInput>
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInput>
export type CreateProfileInput = z.infer<typeof CreateProfileInput>
export type UpdateProfileInput = z.infer<typeof UpdateProfileInput>
