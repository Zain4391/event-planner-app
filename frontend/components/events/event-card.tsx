import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, MapPin, Users, Clock, ImageIcon } from 'lucide-react';
import { Event } from '../../types/api';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  // Format date and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden p-0">
        {/* Event Image */}
        {event.bannerImageUrl && !imageError ? (
          <div className="relative h-48 w-full">
            <Image
              src={event.bannerImageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              unoptimized={true}
            />
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="relative h-48 w-full bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No Image</p>
            </div>
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>
          </div>
        )}

        <div className="p-4">
          <CardHeader className="pb-3 px-0">
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3 px-0">
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">{event.venueName}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {event.availableCapacity} / {event.totalCapacity} spots available
              </span>
            </div>
          </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
