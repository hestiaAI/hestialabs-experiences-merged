import packageJSON from '../package.json'
import { Experience, ExperienceOptions } from '@/index'
import { theDatingPrivacyCollective } from '@/collaborators/index'
import icon from '@/icons/her.png'
import viewBlocks from './blocks'
import databaseConfig from './database'

const options: ExperienceOptions = {
  collaborator: theDatingPrivacyCollective,
  databaseConfig,
  dataPortal: 'https://weareher.com/privacy/',
  dataSamples: ['her-fake-data.zip'],
  files: {
    liked: '**/liked.csv',
    notifications: '**/notifications.csv',
    blocked: '**/blocked.csv',
    messages: '**/messages.csv',
    reported: '**/reported.csv',
    skipped: '**/skipped.csv',
    profiles: '**/profiles.csv'
  },
  icon: icon,
  title: 'HER',
  viewBlocks
}

export default new Experience(options, packageJSON, import.meta.url)
