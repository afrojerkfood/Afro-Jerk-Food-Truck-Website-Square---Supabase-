import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, MapPin, Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import Schedule from '../components/Schedule';
import { toast } from 'react-hot-toast';
import type { Database } from '../lib/database.types';

type Schedule = Database['public']['Tables']['schedules']['Row'];
type Location = Database['public']['Tables']['locations']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

interface ScheduleWithLocation extends Schedule {
  location: Location;
}

export default function Locate() {
  const navigate = useNavigate();
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleWithLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    rating: 5,
    comment: '',
    image: null as File | null
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchTodaySchedule();
      await fetchReviews();
    };
    
    initializeComponent();
  }, []);

  async function fetchTodaySchedule() {
    try {
      console.log('Fetching today\'s schedule...');
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          location:locations(*)
        `)
        .eq('date', today)
        .order('start_time', { ascending: true })
        .limit(1);

      if (error) throw error;
      
      // Handle the case where no schedule is found
      if (!data || data.length === 0) {
        console.log('No schedule found for today');
        setCurrentSchedule(null);
        return;
      }

      // Take the first schedule if multiple exist
      console.log('Schedule data received:', data[0]);
      setCurrentSchedule(data[0]);
      
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to fetch today\'s schedule');
    } finally {
      setLoading(false);
    }
  }
  
  async function fetchReviews() {
    try {
      console.log('Fetching reviews...');
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Reviews data received:', data);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      console.log('Starting image upload:', { fileName: file.name, fileSize: file.size });
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      console.log('Image uploaded successfully');

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('Starting review submission:', { ...reviewForm, image: reviewForm.image?.name });

    try {
      let imageUrl = null;
      if (reviewForm.image) {
        console.log('Uploading review image...');
        imageUrl = await handleImageUpload(reviewForm.image);
      }

      const { error } = await supabase
        .from('reviews')
        .insert([{
          customer_name: reviewForm.customerName,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
          image_url: imageUrl
        }]);

      if (error) throw error;
      console.log('Review submitted successfully');

      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
      setReviewForm({
        customerName: '',
        rating: 5,
        comment: '',
        image: null
      });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Map Section */}
      <div className="h-[40vh] md:h-[50vh] relative overflow-hidden">
        {currentSchedule ? (
          <>
            <img
              src={currentSchedule.location.image_url || 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80'}
              alt={currentSchedule.location.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 mb-6 md:p-6 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{currentSchedule.location.name}</h2>
              <p className="text-white/90 mb-4 text-sm md:text-base">{currentSchedule.location.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSchedule.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-white/90 transition-colors text-sm md:text-base"
              >
                <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                Get Directions
              </a>
            </div>
          </>
        ) : (
          <div className="h-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">No schedule available for today</p>
          </div>
        )}
      </div>

      {/* Location Info */}
      <div className="container mx-auto px-4 py-8">
        {currentSchedule ? (
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm -mt-16 relative z-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Today's Location</h1>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#eb1924] mt-1" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentSchedule.location.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#eb1924] transition-colors"
                >
                  <p className="font-medium">{currentSchedule.location.name}</p>
                  <p className="text-gray-600">{currentSchedule.location.address}</p>
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <p>Hours: {format(new Date(`2000-01-01T${currentSchedule.start_time}`), 'h:mm aa')} - {format(new Date(`2000-01-01T${currentSchedule.end_time}`), 'h:mm aa')}</p>
              </div>
              <button
                onClick={() => navigate('/order')}
                className="w-full bg-[#eb1924] text-white py-3 rounded-full hover:bg-[#eb1924]/90 transition-colors"
              >
                Order Now
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm -mt-16 relative z-10 max-w-2xl mx-auto text-center">
            <p className="text-gray-600">We're not operating today. Check our schedule for upcoming locations!</p>
          </div>
        )}

        {/* Schedule Section */}
        <div className="max-w-4xl mx-auto mt-12 mb-12">
          <Schedule />
        </div>
        
        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto mt-8 md:mt-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Customer Reviews</h2>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-[#01a952] text-white px-4 md:px-6 py-2 rounded-full hover:bg-[#01a952]/90 transition-colors text-sm md:text-base whitespace-nowrap"
            >
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{review.customer_name}</h3>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {review.image_url && (
                  <img
                    src={review.image_url}
                    alt="Review"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Write a Review</h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating })}
                      className={`p-2 rounded-full ${
                        reviewForm.rating >= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb1924] focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Photo (Optional)
                </label>
                <div className="mt-1 flex justify-center px-4 md:px-6 pt-4 md:pt-5 pb-4 md:pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-[#eb1924] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#eb1924] focus-within:ring-offset-2 hover:text-[#eb1924]/90">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setReviewForm({ ...reviewForm, image: file });
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#01a952] text-white hover:bg-[#01a952]/90 transition-colors disabled:bg-gray-400"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}