# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookmarkService do
  subject { described_class.new }

  let(:account) { Fabricate(:account) }
  let(:status) { Fabricate(:status) }

  describe '#call' do
    it 'creates a bookmark without a note' do
      bookmark = subject.call(account, status)

      expect(bookmark).to be_persisted.and have_attributes(account:, status:, note: nil)
    end

    it 'creates a bookmark with a note' do
      expect(subject.call(account, status, note: 'For the newsletter').note)
        .to eq 'For the newsletter'
    end

    it 'bookmarks the original status of a reblog' do
      reblog = Fabricate(:status, reblog: status)

      expect(subject.call(account, reblog).status).to eq status
    end

    it 'does not fail when bookmarking the same reblog twice' do
      reblog = Fabricate(:status, reblog: status)
      subject.call(account, reblog)

      expect { subject.call(account, reblog) }
        .to_not change(Bookmark, :count)
    end

    context 'when the status is already bookmarked' do
      let!(:bookmark) { Fabricate(:bookmark, account:, status:, note: 'First thought') }

      it 'keeps the note when none is given' do
        expect { subject.call(account, status) }
          .to_not(change { bookmark.reload.note })
      end

      it 'only looks up the bookmark when nothing changed' do
        expect { subject.call(account, status) }
          .to execute_queries(1)
        expect { subject.call(account, status, note: ' First thought ') }
          .to execute_queries(1)
      end

      it 'replaces the note' do
        expect { subject.call(account, status, note: 'Second thought') }
          .to change { bookmark.reload.note }.to('Second thought')
      end

      it 'clears the note when given a blank string' do
        expect { subject.call(account, status, note: ' ') }
          .to change { bookmark.reload.note }.to(nil)
      end
    end

    it 'raises when the note is too long' do
      expect { subject.call(account, status, note: 'a' * (Bookmark::NOTE_LENGTH_LIMIT + 1)) }
        .to raise_error(ActiveRecord::RecordInvalid)
    end
  end
end
