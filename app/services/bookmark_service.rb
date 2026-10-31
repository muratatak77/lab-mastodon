# frozen_string_literal: true

class BookmarkService < BaseService
  # Bookmark a status, or update the note on an existing bookmark
  # @param [Account] account
  # @param [Status] status
  # @param [String, nil] note Private note to store; a blank string clears
  #   the note, while `nil` leaves any existing note untouched
  # @return [Bookmark]
  def call(account, status, note: nil)
    bookmark = account.bookmarks.find_or_initialize_by(status: status.proper)
    bookmark.note = note unless note.nil?
    bookmark.save!
    bookmark
  end
end
