import React from 'react';
import Card from '../common/Card'; // Reusing your generic Card

const FormWrapper = ({
  title,
  subtitle,
  children,
  onSubmit,
  id,
  className = ''
}) => {
  return (
    <Card 
      title={title} 
      subtitle={subtitle}
      className={`max-w-2xl mx-auto ${className}`} // Centers the form on the page
    >
      <form 
        id={id}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }} 
        className="space-y-6" // Adds standardized spacing between inputs
      >
        {children}
      </form>
    </Card>
  );
};

export default FormWrapper;
