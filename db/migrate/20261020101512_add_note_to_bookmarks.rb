# frozen_string_literal: true

class AddNoteToBookmarks < ActiveRecord::Migration[8.1]
  def change
    add_column :bookmarks, :note, :text
  end
end
