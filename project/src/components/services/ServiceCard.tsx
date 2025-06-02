import React from 'react';
import { Service } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelect: (serviceId: string) => void;
  isLoading?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect, isLoading = false }) => {
  // Dynamically get icon from Lucide based on the icon name in service
  const IconComponent = service.icon ? Icons[service.icon as keyof typeof Icons] : Icons.MessageCircle;
  
  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600 mr-3">
            {IconComponent && <IconComponent size={24} />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
        </div>
        
        {service.description && (
          <p className="text-gray-600 mb-4 flex-grow">
            {service.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-bold text-gray-900">
            ₹{service.price.toFixed(2)}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSelect(service.id)}
            isLoading={isLoading}
            disabled={!service.isActive || isLoading}
          >
            Get Number
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;