import Button from './ui/button';

interface DifficultyOptionsProps {
  selectedDifficulty: 'easy' | 'medium' | 'hard'
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void
}

export default function DifficultyOptions({ selectedDifficulty, onSelectDifficulty }: DifficultyOptionsProps) {

  return (
    <div className='flex flex-col gap-4 w-full mb-6'>
      <h2 className='font-medium text-sm md:text-base'>Choose diffculty :</h2>

      <div className='flex flex-wrap gap-4 w-full justify-center'>
        <Button
          variant='success'
          isSelected={selectedDifficulty === 'easy'}
          onClick={() => onSelectDifficulty('easy')}
          className='text-sm md:text-base'
        >
          Easy
        </Button>
        <Button
          variant='warning'
          isSelected={selectedDifficulty === 'medium'}
          onClick={() => onSelectDifficulty('medium')}
          className='text-sm md:text-base'
        >
          Medium
        </Button>
        <Button
          variant='danger'
          isSelected={selectedDifficulty === 'hard'}
          onClick={() => onSelectDifficulty('hard')}
          className='text-sm md:text-base'
        >
          Hard
        </Button>
      </div>
    </div>
  )
}