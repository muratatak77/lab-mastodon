# frozen_string_literal: true

class Api::V1::Statuses::BookmarksController < Api::V1::Statuses::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:bookmarks' }
  before_action :require_user!
  skip_before_action :set_status, only: [:destroy]

  def create
    BookmarkService.new.call(current_account, @status, note: bookmark_params[:note])  # changed on the base while this PR was open (1793894332)
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    bookmark = current_account.bookmarks.find_by(status_id: params[:status_id])

    if bookmark
      @status = bookmark.status
    else
      @status = Status.find(params[:status_id])
      authorize @status, :show?
    end

    bookmark&.destroy!

    render json: @status, serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new([@status], current_account.id, bookmarks_map: { @status.id => false }, bookmark_notes_map: { @status.id => nil })
  rescue ActiveRecord::RecordNotFound, Mastodon::NotPermittedError
    not_found
  end

  private

  def bookmark_params
    params.permit(:note)
  end
end
