import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { PencilIcon } from '@phosphor-icons/react';

import { openModal } from '@/mastodon/actions/modal';
import { IconButton } from '@/mastodon/components/button/redesign';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';

import classes from './bookmark_note.module.scss';

const messages = defineMessages({
  label: { id: 'status.bookmark_note.label', defaultMessage: 'Your note' },
  edit: { id: 'status.bookmark_note.edit', defaultMessage: 'Edit note' },
});

export const StatusBookmarkNote: React.FC<{ statusId: string }> = ({
  statusId,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const note = useAppSelector(
    (state) =>
      state.statuses.getIn([statusId, 'bookmark_note']) as
        string | null | undefined,
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      // The note sits inside the clickable area that opens the post.
      e.stopPropagation();
      dispatch(
        openModal({ modalType: 'BOOKMARK_NOTE', modalProps: { statusId } }),
      );
    },
    [dispatch, statusId],
  );

  if (!note) {
    return null;
  }

  return (
    <aside
      className={classes.root}
      aria-label={intl.formatMessage(messages.label)}
    >
      <p className={classes.text}>{note}</p>
      <IconButton icon={PencilIcon} size='sm' onClick={handleEdit}>
        {intl.formatMessage(messages.edit)}
      </IconButton>
    </aside>
  );
};
