import { FontAwesomeIcon } from './font-awesome-icon';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDiscipline: string;
  onDisciplineChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  selectedJobType: string;
  onJobTypeChange: (value: string) => void;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  selectedExperienceType?: string;
  onExperienceTypeChange?: (value: string) => void;
  disciplineOptions: string[];
  locationOptions: string[];
  jobTypeOptions: string[];
  statusOptions?: string[];
  experienceTypeOptions?: string[];
  onClearFilters: () => void;
}

function FilterDropdown({ 
  label, 
  value, 
  options, 
  onChange, 
  icon
}: { 
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="box-border content-stretch flex items-center px-[9px] py-[7px] relative rounded-[4px] shrink-0 cursor-pointer border border-[#888888] hover:bg-gray-50 transition-colors bg-transparent"
                type="button">
          <div className="box-border content-stretch flex flex-col h-[20px] items-start pl-0 pr-[8px] py-0 relative shrink-0 w-[28px]">
            <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[20px]">
              <FontAwesomeIcon name={icon as any} className="w-5 h-5 text-[#5D779A]" />
            </div>
          </div>
          <div className="box-border content-stretch flex flex-col items-start pl-0 pr-[8px] py-0 relative shrink-0">
            <div className="content-stretch flex items-center relative shrink-0">
              <div className="content-stretch flex flex-col items-center relative shrink-0">
                <div className="flex flex-col font-['Roboto',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-gray-900 text-nowrap">
                  <p className="leading-[20px] whitespace-pre">
                    {value === 'All' ? label : value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-w-64">
        {options.map((option, index) => (
          <DropdownMenuItem
            key={`${option}-${index}`}
            onClick={() => onChange(option)}
            className={value === option ? 'bg-blue-50' : ''}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedDiscipline,
  onDisciplineChange,
  selectedLocation,
  onLocationChange,
  selectedJobType,
  onJobTypeChange,
  selectedStatus,
  onStatusChange,
  selectedExperienceType,
  onExperienceTypeChange,
  disciplineOptions,
  locationOptions,
  jobTypeOptions,
  statusOptions,
  experienceTypeOptions,
  onClearFilters
}: FilterBarProps) {
  const hasActiveFilters = 
    selectedDiscipline !== 'All' || 
    selectedLocation !== 'All' || 
    selectedJobType !== 'All' ||
    (selectedStatus && selectedStatus !== 'All') ||
    (selectedExperienceType && selectedExperienceType !== 'All');

  return (
    <div className="bg-white relative w-full">
      <div className="relative w-full">
          
          {/* Main Filter Container */}
          <div className="content-stretch flex items-start relative shrink-0 w-full px-[0px] py-[4px] mx-[0px] my-[4px]">
            <div className="h-[34px] relative shrink-0 w-full flex items-center px-[0px] py-[4px] mx-[0px] my-[4px]">
              
              {/* Search Input */}
              <div className="relative w-[240px]">
                <FontAwesomeIcon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Job Title, Location..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-[36px] border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 rounded-md bg-white text-sm font-['Roboto'] placeholder:text-gray-500 shadow-none"
                />
              </div>

              {/* Separator */}
              <div className="h-[24px] w-px bg-gray-300 mx-3 py-[4px] mx-[12px] my-[4px] p-[0px]"></div>

              {/* Filter Buttons Container */}
              <div className="flex items-center gap-3 flex-1">
                <FilterDropdown
                  label="Discipline"
                  value={selectedDiscipline}
                  options={disciplineOptions}
                  onChange={onDisciplineChange}
                  icon="stethoscope"
                />

                <FilterDropdown
                  label="Location Groups"
                  value={selectedLocation}
                  options={locationOptions}
                  onChange={onLocationChange}
                  icon="locationDot"
                />

                <FilterDropdown
                  label="Job Type"
                  value={selectedJobType}
                  options={jobTypeOptions}
                  onChange={onJobTypeChange}
                  icon="briefcase"
                />

                {/* Status Filter - Only show if provided */}
                {statusOptions && onStatusChange && selectedStatus && (
                  <FilterDropdown
                    label="Status"
                    value={selectedStatus}
                    options={statusOptions}
                    onChange={onStatusChange}
                    icon="circleCheck"
                  />
                )}

                {/* Experience Type Filter - Only show if provided */}
                {experienceTypeOptions && onExperienceTypeChange && selectedExperienceType && (
                  <FilterDropdown
                    label="Experience"
                    value={selectedExperienceType}
                    options={experienceTypeOptions}
                    onChange={onExperienceTypeChange}
                    icon="graduationCap"
                  />
                )}

                {/* Reset Button */}
                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="box-border content-stretch flex items-center px-0 py-[7.4px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <div className="box-border content-stretch flex flex-col h-[16px] items-start pl-0 pr-[8px] py-0 relative shrink-0 w-[24px]">
                      <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[16px]">
                        <FontAwesomeIcon name="arrowRotateLeft" className="w-4 h-4 text-current" />
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-center relative shrink-0">
                      <div className="flex flex-col font-['Roboto',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12.8px] text-center text-nowrap">
                        <p className="leading-[19.2px] whitespace-pre">Reset</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Add Filter Button */}
                <button 
                  type="button"
                  className="box-border content-stretch flex items-center px-[9px] py-[7px] relative rounded-[4px] shrink-0 border border-[#3f51b5] cursor-pointer hover:bg-blue-50 transition-colors bg-transparent"
                >
                  <div className="box-border content-stretch flex flex-col h-[16px] items-start pl-0 pr-[8px] py-0 relative shrink-0 w-[24px]">
                    <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 size-[16px]">
                      <FontAwesomeIcon name="plus" className="w-4 h-4 text-[#3F51B5]" />
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-center relative shrink-0">
                    <div className="flex flex-col font-['Roboto',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3f51b5] text-[12.8px] text-center text-nowrap">
                      <p className="leading-[19.2px] whitespace-pre">Add Filter</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
