'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApi } from '@/hooks/use-api'
import { User } from '@/types'
import { Plus, Edit, Trash2, Loader2, X, AlertCircle } from 'lucide-react'

interface DoctorManagementProps {
  doctors: User[]
  onDoctorsUpdate: () => void
}

export function DoctorManagement({ doctors, onDoctorsUpdate }: DoctorManagementProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: ''
  })
  const [error, setError] = useState<string>('')
  const { callApi, isLoading } = useApi()

  const handleEdit = (doctor: User) => {
    console.log('Editing doctor:', doctor);
    
    const doctorId = doctor.id;
    if (!doctorId) {
      console.error('Doctor has no ID:', doctor);
      setError('Cannot edit doctor: No ID found');
      return;
    }
    
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: '',
      specialization: doctor.specialization || ''
    });
    setIsAdding(true);
    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      console.log('🔄 Submitting doctor data:', { 
        editingDoctor, 
        formData,
        doctorId: editingDoctor?.id
      });

      // Validate form data
      if (!formData.name.trim()) {
        setError('Name is required')
        return
      }
      
      if (!formData.email.trim()) {
        setError('Email is required')
        return
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        return
      }

      if (!formData.specialization.trim()) {
        setError('Specialization is required')
        return
      }

      // Validate password for new doctors
      if (!editingDoctor && (!formData.password || formData.password.length < 6)) {
        setError('Password must be at least 6 characters long for new doctors')
        return
      }

      if (editingDoctor) {
        const doctorId = editingDoctor.id;
        if (!doctorId) {
          setError('Doctor ID is missing. Please refresh and try again.');
          return;
        }
        console.log('📝 Updating doctor with ID:', doctorId);

        const updateData: any = {}
        if (formData.name !== editingDoctor.name) updateData.name = formData.name
        if (formData.email !== editingDoctor.email) updateData.email = formData.email
        if (formData.password && formData.password.length >= 6) updateData.password = formData.password
        if (formData.specialization !== editingDoctor.specialization) updateData.specialization = formData.specialization
        
        if (Object.keys(updateData).length > 0) {
          console.log('🔄 Sending update request:', { doctorId, updateData });
          await callApi('patch', `/admin/doctors/${doctorId}`, updateData)
          alert('Doctor updated successfully!')
        } else {
          setError('No changes made')
          return
        }
      } else {
        // Check if email already exists in the current list
        const emailExists = doctors.some(doctor => 
          doctor.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (emailExists) {
          setError('This email is already registered. Please use a different email.');
          return;
        }

        await callApi('post', '/admin/doctors', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          specialization: formData.specialization,
          role: 'doctor'
        })
        alert('Doctor created successfully!')
      }
      
      // Reset form and refresh doctors list
      setFormData({ name: '', email: '', password: '', specialization: '' })
      setEditingDoctor(null)
      setIsAdding(false)
      onDoctorsUpdate()
    } catch (error: unknown) {
      console.error('❌ Error saving doctor:', error)
      
      let errorMessage = 'Error saving doctor. Please try again.'
      
      if (error instanceof Error) {
        // Show the actual error message from the backend
        errorMessage = error.message;
        
        // Make user-friendly messages
        if (error.message.includes('Email already in use')) {
          errorMessage = 'This email address is already registered. Please use a different email.';
        } else if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else if (error.message.includes('Invalid doctor ID') || error.message.includes('Cast to ObjectId')) {
          errorMessage = 'Invalid doctor ID. Please refresh the page and try again.';
        }
      }
      
      setError(errorMessage)
    }
  }

  const handleDelete = async (doctorId: string) => {
    if (!doctorId) {
      setError('Doctor ID is missing');
      return;
    }

    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return
    
    try {
      await callApi('delete', `/admin/doctors/${doctorId}`)
      onDoctorsUpdate()
      alert('Doctor deleted successfully!')
    } catch (error: unknown) {
      console.error('Error deleting doctor:', error)
      if (error instanceof Error) {
        setError(error.message || 'Error deleting doctor')
      } else {
        setError('Error deleting doctor')
      }
    }
  }

  const toggleStatus = async (doctor: User) => {
    const doctorId = doctor.id;
    if (!doctorId) {
      setError('Doctor ID is missing');
      return;
    }

    try {
      await callApi('patch', `/admin/doctors/${doctorId}/status`, {
        isActive: !doctor.isActive
      })
      onDoctorsUpdate()
      alert(`Doctor ${!doctor.isActive ? 'activated' : 'deactivated'} successfully!`)
    } catch (error: unknown) {
      console.error('Error updating doctor status:', error)
      if (error instanceof Error) {
        setError(error.message || 'Error updating doctor status')
      } else {
        setError('Error updating doctor status')
      }
    }
  }

  const cancelForm = () => {
    setFormData({ name: '', email: '', password: '', specialization: '' })
    setEditingDoctor(null)
    setIsAdding(false)
    setError('')
  }

  if (!isAdding) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setIsAdding(true)} className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Add New Doctor
        </Button>

        {doctors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No doctors found. Add your first doctor to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => {
              const doctorId = doctor.id;
              return (
                <div key={doctorId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{doctor.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      doctor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{doctor.email}</p>
                  <p className="text-sm font-medium">{doctor.specialization}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined: {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(doctor)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={doctor.isActive ? "outline" : "default"}
                      onClick={() => toggleStatus(doctor)}
                      className="flex-1"
                    >
                      {doctor.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(doctorId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={cancelForm}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              setError('')
            }}
            placeholder="Dr. John Doe"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              setError('')
            }}
            placeholder="doctor@example.com"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">
          {editingDoctor ? 'New Password (leave blank to keep current)' : 'Password *'}
        </Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value })
            setError('')
          }}
          placeholder="••••••••"
          required={!editingDoctor}
          minLength={6}
        />
        {editingDoctor && (
          <p className="text-xs text-muted-foreground">
            Only enter a password if you want to change it
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization *</Label>
        <Select
          value={formData.specialization}
          onValueChange={(value) => {
            setFormData({ ...formData, specialization: value })
            setError('')
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cardiology">Cardiology</SelectItem>
            <SelectItem value="Dermatology">Dermatology</SelectItem>
            <SelectItem value="Neurology">Neurology</SelectItem>
            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
            <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
            <SelectItem value="Psychiatry">Psychiatry</SelectItem>
            <SelectItem value="Dentistry">Dentistry</SelectItem>
            <SelectItem value="Gynecology">Gynecology</SelectItem>
            <SelectItem value="Urology">Urology</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={cancelForm}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>

      {/* Help Text */}
      {!editingDoctor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Each doctor must have a unique email address. 
            If you see an "Email already in use" error, please use a different email.
          </p>
        </div>
      )}
    </form>
  )
}