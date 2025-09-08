import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Accessibility } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  imageUrl: string;
  equipment: string[];
  isAccessible: boolean;
  description?: string;
  todayAvailability: TimeSlot[];
}

interface RoomCardProps {
  room: Room;
  onBookRoom: (room: Room) => void;
}

const getEquipmentIcon = (equipment: string) => {
  if (equipment.toLowerCase().includes('display') || equipment.toLowerCase().includes('tv')) {
    return 'fas fa-tv';
  }
  if (equipment.toLowerCase().includes('video') || equipment.toLowerCase().includes('conf')) {
    return 'fas fa-video';
  }
  if (equipment.toLowerCase().includes('projector')) {
    return 'fas fa-projector';
  }
  if (equipment.toLowerCase().includes('whiteboard') || equipment.toLowerCase().includes('board')) {
    return 'fas fa-chalkboard';
  }
  if (equipment.toLowerCase().includes('computer') || equipment.toLowerCase().includes('desktop')) {
    return 'fas fa-desktop';
  }
  if (equipment.toLowerCase().includes('microphone') || equipment.toLowerCase().includes('audio')) {
    return 'fas fa-microphone';
  }
  if (equipment.toLowerCase().includes('wifi')) {
    return 'fas fa-wifi';
  }
  if (equipment.toLowerCase().includes('power') || equipment.toLowerCase().includes('outlet')) {
    return 'fas fa-plug';
  }
  if (equipment.toLowerCase().includes('print')) {
    return 'fas fa-print';
  }
  return 'fas fa-cog';
};

export default function RoomCard({ room, onBookRoom }: RoomCardProps) {
  const availableSlots = room.todayAvailability.filter(slot => slot.available);
  const bookedSlots = room.todayAvailability.filter(slot => !slot.available);
  const isAvailable = availableSlots.length > 0;

  return (
    <Card className="room-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <img 
        src={room.imageUrl} 
        alt={room.name}
        className="w-full h-48 object-cover"
      />
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-room-name-${room.id}`}>
            {room.name}
          </h3>
          <Badge 
            variant={isAvailable ? "secondary" : "destructive"}
            data-testid={`badge-availability-${room.id}`}
          >
            {isAvailable ? "Available" : "Booked"}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4" data-testid={`text-location-${room.id}`}>
          {room.building}, {room.floor}
        </p>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground" data-testid={`text-capacity-${room.id}`}>
              {room.capacity} people
            </span>
          </div>
          {room.isAccessible && (
            <div className="flex items-center space-x-1">
              <Accessibility className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Accessible</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Equipment</h4>
          <div className="flex flex-wrap gap-2">
            {room.equipment.map((item, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
                data-testid={`badge-equipment-${room.id}-${index}`}
              >
                <i className={`${getEquipmentIcon(item)} mr-1`}></i>
                {item}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Today's Availability</h4>
          <div className="grid grid-cols-4 gap-1">
            {room.todayAvailability.slice(0, 4).map((slot, index) => (
              <div
                key={index}
                className={`time-slot border rounded text-xs text-center py-1 ${
                  slot.available
                    ? 'border-green-300 bg-green-50 dark:bg-green-950'
                    : 'border-red-300 bg-red-50 dark:bg-red-950 opacity-60'
                }`}
                data-testid={`time-slot-${room.id}-${index}`}
              >
                {slot.time}
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={() => onBookRoom(room)}
          className="w-full"
          data-testid={`button-book-${room.id}`}
        >
          Book Room
        </Button>
      </CardContent>
    </Card>
  );
}
