import Button from './ui/button';

interface ProblemTypeProps {
  selectedTopic: 'addition' | 'subtraction' | 'multiplication' | 'division'
  onSelectTopic: (topic: 'addition' | 'subtraction' | 'multiplication' | 'division') => void
}

export default function ProblemTypeOptions({ selectedTopic, onSelectTopic }: ProblemTypeProps) {

  return (
    <div className='flex flex-col gap-4 w-full mb-6'>
      <h2 className='font-medium text-sm md:text-base'>Choose problem type :</h2>

      <div className='flex flex-wrap gap-4 w-full justify-center'>
        <Button
          variant='blue'
          isSelected={selectedTopic === 'addition'}
          onClick={() => onSelectTopic('addition')}
          className='text-sm md:text-base'
        >
          Addition
        </Button>
        <Button
          variant='purple'
          isSelected={selectedTopic === 'subtraction'}
          onClick={() => onSelectTopic('subtraction')}
          className='text-sm md:text-base'
        >
          Subtraction
        </Button>
        <Button
          variant='indigo'
          isSelected={selectedTopic === 'multiplication'}
          onClick={() => onSelectTopic('multiplication')}
          className='text-sm md:text-base'
        >
          Multiplication
        </Button>
        <Button
          variant='pink'
          isSelected={selectedTopic === 'division'}
          onClick={() => onSelectTopic('division')}
          className='text-sm md:text-base'
        >
          Division
        </Button>
      </div>
    </div>
  )
}
