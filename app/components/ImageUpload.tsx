import MediaSelector from './MediaSelector'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  return (
    <MediaSelector 
      value={value} 
      onChange={onChange} 
      disabled={disabled}
      showMediaLibrary={true}
    />
  )
}