class CreateIndiaHighways < ActiveRecord::Migration
  def change
    create_table :india_highways do |t|
      t.string :osm_id
      t.multi_line_string :geom, :srid => 4326

      t.timestamps null: false
    end

    change_table :india_highways do |t|
      t.index :geom, using: :gist
    end


  end
end
