// components/admin/doctor-management.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useApi } from '@/hooks/use-api'
import { User } from '@/types'
import { Plus, Edit, Trash2, Loader2, X } from 'lucide-react'

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
  const { callApi, isLoading } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingDoctor) {
        // For update, only send changed fields
        const updateData: any = {}
        if (formData.name !== editingDoctor.name) updateData.name = formData.name
        if (formData.email !== editingDoctor.email) updateData.email = formData.email
        if (formData.password) updateData.password = formData.password
        if (formData.specialization !== editingDoctor.specialization) updateData.specialization = formData.specialization
        
        if (Object.keys(updateData).length > 0) {
          await callApi('patch', `/admin/doctors/${editingDoctor.id}`, updateData)
        }
      } else {
        await callApi('post', '/admin/doctors', {
          ...formData,
          role: 'doctor'
        })
      }
      
      // Reset form and refresh doctors list
      setFormData({ name: '', email: '', password: '', specialization: '' })
      setEditingDoctor(null)
      setIsAdding(false)
      onDoctorsUpdate()
    } catch (error: any) {
      console.error('Error saving doctor:', error)
      alert(error.response?.data?.message || 'Error saving doctor')
    }
  }

  const handleEdit = (doctor: User) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      email: doctor.email,
      password: '',
      specialization: doctor.specialization || ''
    })
    setIsAdding(true)
  }

  const handleDelete = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return
    
    try {
      await callApi('delete', `/admin/doctors/${doctorId}`)
      onDoctorsUpdate()
    } catch (error: any) {
      console.error('Error deleting doctor:', error)
      alert(error.response?.data?.message || 'Error deleting doctor')
    }
  }

  const toggleStatus = async (doctor: User) => {
    try {
      await callApi('patch', `/admin/doctors/${doctor.id}/status`, {
        isActive: !doctor.isActive
      })
      onDoctorsUpdate()
    } catch (error: any) {
      console.error('Error updating doctor status:', error)
      alert(error.response?.data?.message || 'Error updating doctor status')
    }
  }

  const cancelForm = () => {
    setFormData({ name: '', email: '', password: '', specialization: '' })
    setEditingDoctor(null)
    setIsAdding(false)
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
            {doctors.map((doctor) => (
              <div key={doctor.id} className="border rounded-lg p-4 space-y-3">
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
                    onClick={() => handleDelete(doctor.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
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
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          onValueChange={(value) => setFormData({ ...formData, specialization: value })}
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
    </form>
  )
}