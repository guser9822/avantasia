/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage component.
 */
import { defineMessages } from 'react-intl';

export const scope = 'boilerplate.components.Header';

export default defineMessages({
  home: {
    id: `${scope}.home`,
    defaultMessage: 'Hom',
  },
  features: {
    id: `${scope}.features`,
    defaultMessage: 'Features',
  },
  bsmessage: {
    id: `${scope}.bsmessage`,
    defaultMessage: 'Blockchain message',
  },
});
