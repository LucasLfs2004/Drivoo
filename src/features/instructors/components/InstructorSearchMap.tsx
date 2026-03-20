import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { InstructorMapMarker } from './InstructorMapMarker';
import { theme } from '../../../theme';
import type { InstrutorDisponivel } from '../types/domain';

interface InstructorSearchMapProps {
  mapRef: React.RefObject<MapView | null>;
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
  data: InstrutorDisponivel[];
  selectedInstructorId: string | null;
  onMarkerPress: (instructor: InstrutorDisponivel) => void;
}

export const InstructorSearchMap: React.FC<InstructorSearchMapProps> = ({
  mapRef,
  region,
  onRegionChangeComplete,
  data,
  selectedInstructorId,
  onMarkerPress,
}) => {
  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled
        loadingIndicatorColor={theme.colors.primary[500]}
      >
        {data.map((instructor) => {
          if (!instructor.localizacao.coordenadas) {
            return null;
          }

          return (
            <Marker
              key={instructor.id}
              coordinate={instructor.localizacao.coordenadas}
              onPress={() => onMarkerPress(instructor)}
            >
              <InstructorMapMarker
                instructor={instructor}
                isSelected={selectedInstructorId === instructor.id}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    minHeight: 280,
  },
  map: {
    flex: 1,
  },
});
