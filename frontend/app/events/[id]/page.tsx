'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Event, ApiResponse } from '../../../types/api';
import { apiClient } from '../../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Calendar, MapPin, Users, Clock, ArrowLeft, ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.events.getById(eventId);
        const eventData = response.data as ApiResponse<Event>;
        
        setEvent(eventData.data || null);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Event Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || 'The event you are looking for does not exist.'}
            </p>
            <div className="flex gap-2">
              <Link href="/events">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        {/* Event Header */}
        <Card className="mb-6 overflow-hidden">
          {/* Event Image */}
          {event.bannerImageUrl && !imageError ? (
            <div className="relative h-64 w-full">
              <Image
                src={event.bannerImageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                onError={() => setImageError(true)}
                unoptimized={true}
              />
              <div className="absolute top-4 right-4">
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="h-64 w-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No Image Available</p>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{event.title}</CardTitle>
            {event.description && (
              <p className="text-gray-600 text-lg mt-2">{event.description}</p>
            )}
          </CardHeader>
        </Card>

        {/* Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                    <span className="font-semibold">{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center text-lg">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <span>
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">{event.venueName}</div>
                  <div className="text-gray-600">{event.venueAddress}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {event.availableCapacity}
                  </div>
                  <div className="text-gray-600">
                    of {event.totalCapacity} spots available
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(event.availableCapacity / event.totalCapacity) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  Register for Event
                </Button>
                <Button variant="outline" className="w-full">
                  Share Event
                </Button>
                <Button variant="outline" className="w-full">
                  Add to Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
