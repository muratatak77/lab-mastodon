import { useCallback, useId, useState } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { saveBookmarkNote } from '@/mastodon/actions/interactions_typed';
import { TextAreaField } from '@/mastodon/components/form_fields';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';

import { ConfirmationModal } from './confirmation_modals/confirmation_modal';

// Keep in sync with Bookmark::NOTE_LENGTH_LIMIT
export const BOOKMARK_NOTE_MAX_LENGTH = 1000;

const messages = defineMessages({
  addTitle: { id: 'bookmark_note_modal.add_title', defaultMessage: 'Add note' },
  editTitle: {
    id: 'bookmark_note_modal.edit_title',
    defaultMessage: 'Edit note',
  },
  label: {
    id: 'bookmark_note_modal.label',
    defaultMessage: 'Why did you save this post?',
  },
  hint: {
    id: 'bookmark_note_modal.hint',
    defaultMessage:
      'Only you can see this note. It will be deleted if you remove the bookmark. {count, plural, one {# character} other {# characters}} left.',
  },
  saveError: {
    id: 'bookmark_note_modal.save_error',
    defaultMessage: 'Your note could not be saved. Please try again.',
  },
});

export const BookmarkNoteModal: React.FC<{
  statusId: string;
  onClose: () => void;
}> = ({ statusId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const fieldId = useId();
  const savedNote = useAppSelector(
    (state) =>
      (state.statuses.getIn([statusId, 'bookmark_note']) as
        string | null | undefined) ?? '',
  );

  const [note, setNote] = useState(savedNote);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const remaining = BOOKMARK_NOTE_MAX_LENGTH - note.length;

  const handleChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >((e) => {
    setNote(e.target.value);
    setFailed(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    setFailed(false);

    const result = await dispatch(saveBookmarkNote({ statusId, note }));

    if (saveBookmarkNote.fulfilled.match(result)) {
      onClose();
    } else {
      setSaving(false);
      setFailed(true);
    }
  }, [dispatch, statusId, note, onClose]);

  return (
    <ConfirmationModal
      title={intl.formatMessage(
        savedNote ? messages.editTitle : messages.addTitle,
      )}
      confirm={
        <FormattedMessage id='bookmark_note_modal.save' defaultMessage='Save' />
      }
      onClose={onClose}
      onConfirm={handleConfirm}
      noCloseOnConfirm
      noFocusButton
      updating={saving}
      disabled={remaining < 0}
    >
      <TextAreaField
        id={fieldId}
        label={intl.formatMessage(messages.label)}
        hint={intl.formatMessage(messages.hint, {
          count: Math.max(remaining, 0),
        })}
        status={
          failed
            ? {
                variant: 'error',
                message: intl.formatMessage(messages.saveError),
              }
            : undefined
        }
        value={note}
        onChange={handleChange}
        maxLength={BOOKMARK_NOTE_MAX_LENGTH}
        minRows={4}
        autoSize
        required={false}
      />
    </ConfirmationModal>
  );
};
