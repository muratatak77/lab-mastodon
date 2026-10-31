# frozen_string_literal: true

require 'rails_helper'

RSpec.describe HashtagNormalizer do
  subject { described_class.new }

  describe '#normalize' do
    it 'converts full-width Latin characters into basic Latin characters' do
      expect(subject.normalize('Ｓｙｎｔｈｗａｖｅ')).to eq 'synthwave'
    end

    it 'converts half-width Katakana into Kana characters' do
      expect(subject.normalize('ｼｰｻｲﾄﾞﾗｲﾅｰ')).to eq 'シーサイドライナー'
    end

    it 'converts modified Latin characters into basic Latin characters' do
      expect(subject.normalize('BLÅHAJ')).to eq 'blahaj'
    end

    it 'strips out invalid characters' do
      expect(subject.normalize('#foo')).to eq 'foo'
    end

    it 'strips out middle dots' do
      expect(subject.normalize('a·b')).to eq 'ab'
    end

    it 'keeps valid characters' do
      expect(subject.normalize('a_b')).to eq 'a_b'
    end
  end
end
