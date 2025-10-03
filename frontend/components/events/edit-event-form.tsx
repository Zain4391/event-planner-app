'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar, MapPin, Users, Clock, Image as ImageIcon, Loader2, ArrowLeft } from 'lucide-react';
import { Category, CategoryListResponse, Event } from '../../types/api';
import { apiClient } from '../../lib/api';

// Form validation schema
const editEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  venueName: z.string().min(1, 'Venue name is required').max(255, 'Venue name must be less than 255 characters'),
  venueAddress: z.string().min(1, 'Venue address is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  totalCapacity: z.number().min(1, 'Capacity must be at least 1'),
  bannerImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EditEventFormProps {
  event: Event;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
}

export function EditEventForm({ event, onSuccess, onCancel }: EditEventFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description || '',
      categoryId: event.categoryId || '',
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      eventDate: event.eventDate.split('T')[0], // Convert to YYYY-MM-DD format
      startTime: event.startTime,
      endTime: event.endTime,
      totalCapacity: event.totalCapacity,
      bannerImageUrl: event.bannerImageUrl || '',
    },
  });


  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await apiClient.categories.getAll();
        const data = response.data as CategoryListResponse;
        setCategories(data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: EditEventFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Clean up the data
      const eventData = {
        ...data,
        bannerImageUrl: data.bannerImageUrl || undefined,
      };

      const response = await apiClient.events.update(event.id, eventData);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err: unknown) {
      console.error('Error updating event:', err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to update event';
      setError(errorMessage || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Edit Event
          </CardTitle>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter event title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  onValueChange={(value) => setValue('categoryId', value)}
                  disabled={categoriesLoading}
                  defaultValue={event.categoryId}
                >
                  <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Describe your event..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Venue Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Venue Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name *</Label>
                <Input
                  id="venueName"
                  {...register('venueName')}
                  placeholder="Enter venue name"
                  className={errors.venueName ? 'border-red-500' : ''}
                />
                {errors.venueName && (
                  <p className="text-sm text-red-500">{errors.venueName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address *</Label>
                <Input
                  id="venueAddress"
                  {...register('venueAddress')}
                  placeholder="Enter venue address"
                  className={errors.venueAddress ? 'border-red-500' : ''}
                />
                {errors.venueAddress && (
                  <p className="text-sm text-red-500">{errors.venueAddress.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  {...register('eventDate')}
                  className={errors.eventDate ? 'border-red-500' : ''}
                />
                {errors.eventDate && (
                  <p className="text-sm text-red-500">{errors.eventDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                  className={errors.startTime ? 'border-red-500' : ''}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-500">{errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                  className={errors.endTime ? 'border-red-500' : ''}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-500">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Capacity & Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Capacity & Media
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalCapacity">Total Capacity *</Label>
                <Input
                  id="totalCapacity"
                  type="number"
                  min="1"
                  {...register('totalCapacity', { valueAsNumber: true })}
                  className={errors.totalCapacity ? 'border-red-500' : ''}
                />
                {errors.totalCapacity && (
                  <p className="text-sm text-red-500">{errors.totalCapacity.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  Current available: {event.availableCapacity} spots
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="bannerImageUrl"
                    {...register('bannerImageUrl')}
                    placeholder="https://example.com/image.jpg"
                    className={`pl-10 ${errors.bannerImageUrl ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.bannerImageUrl && (
                  <p className="text-sm text-red-500">{errors.bannerImageUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Event...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

