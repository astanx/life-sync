import { FC } from 'react'

interface Props {
    title: string
}

const Button: FC<Props> = ({title}) => {
  return (
    <button className=''>
        {title}
    </button>
  )
}

export default Button
