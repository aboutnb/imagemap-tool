// 应用配置信息
// 请根据您的实际信息修改以下内容

export const APP_CONFIG = {
  // 作者信息
  author: {
    name: 'XiaoBo',
    email: 'your.email@example.com', // 可选
    website: 'https://aboutnb.com', // 可选
  },
  
  // 项目信息
  project: {
    name: 'ImageMap Editor',
    description: 'Create interactive HTML image maps with ease',
    version: '1.0.0',
    repository: {
      type: 'github',
      url: 'https://github.com/aboutnb/imagemap-editor',
    },
  },
  
  // 社交链接
  social: {
    github: 'https://github.com/yourusername',
    twitter: 'https://twitter.com/yourusername', // 可选
    linkedin: 'https://linkedin.com/in/yourusername', // 可选
  },
} as const

// 类型定义
export type AppConfig = typeof APP_CONFIG
