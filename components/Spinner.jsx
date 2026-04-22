import React from 'react'
import spinnerGif from '../public/spinner.gif'
import Image from 'next/image'

const Spinner = () => {
  return <Image className='w-[200px] m-auto' src={spinnerGif} alt='loading..' />
}

export default Spinner