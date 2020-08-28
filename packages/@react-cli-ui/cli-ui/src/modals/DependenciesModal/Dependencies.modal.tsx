import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@components'
import { Input, Select } from 'common'

import css from './style.module.scss'

export interface ModalFolder {
    visible?: boolean;
    showModal?(e: React.MouseEvent<HTMLElement>): void;
    closeModal?(e: React.MouseEvent<HTMLElement>): void;
}

const optionsType = [
   { value: 'dependencies', label: 'dependencies' },
   { value: 'devDependencies', label: 'devDependencies' }
]

function DependenciesModal({visible, closeModal}: ModalFolder) {
   const { t } = useTranslation('modal')
   const [state, setState] = useState({
      type: optionsType[0],
      name: '',
    })

   function handleChange ({ value, name }: { value: string, name: string }) {
      setState((prevState) => ({ ...prevState, [name]: value }))
   }

   function onSubmit (e: React.MouseEvent<HTMLButtonElement>) {
      e.preventDefault()
      typeof closeModal === 'function' && closeModal(e)
   }

   return (
      <div className={css.modal}>
         <Modal
            title={`${t('titleDepend')}`}
            okText={`${t('install')}`}
            visible={visible}
            onOk={onSubmit}
            onCancel={closeModal}
         >
         <Select
            name="type"
            label={t('packageManager')}
            onChange={handleChange}
            options={optionsType}
            value={state.type}
         />
         <Input
            name="name"
            label={t('nameProject')}
            placeholder={t('typeName')}
            className={css.projectName}
            value={state.name}
            onChange={handleChange}
            />
            Componet list
         </Modal>
      </div>
    )
}

export default React.memo(DependenciesModal)