class IndiaHighway < ActiveRecord::Base


  scope :open_poi, -> (poiList, distanceFromPoint) {
    open_poi_list ||= []

    poiList.each do |poi|

    cnt =   IndiaHighway.count_by_sql("Select COUNT(*) from india_highway where (ST_DWithin(geography(india_highway.geom),geography(ST_GeomFromText('POINT(" + poi['lng'].to_s + " " + poi['lat'].to_s+ ")', 4326))," + distanceFromPoint.to_s + "))")

    puts cnt

    if cnt == 0
      open_poi_list.push(poi)

    end
    end

    return open_poi_list.to_json

  }

end


