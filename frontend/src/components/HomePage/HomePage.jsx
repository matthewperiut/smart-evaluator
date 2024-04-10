import './HomePage.css';
import Header from '../Header/Header';
import TableDisplay from '../TableDisplay/TableDisplay';
import Modal from '../Modal/Modal';

const HomePage = ({ excelData, solutionId, isExcelUploaded, onExcelUpload, fileName, setIsExcelUploaded }) => {
    return (
        <div>
            <Header />
            <nav className='nav-list'>
                <button className="nav-link">Existing Session IDs</button>
            </nav>
            <div>
                <div>
                    {!isExcelUploaded ? (
                        <h2 className='font-poppins text-green absolute left-4 top-20 md:absolute p-4 rounded-lg sm:text-xs lg:text-lg md:text-md'>Work Dashboard</h2>
                    ) : (
                        <h2 className='font-poppins text-green absolute left-4 top-20 md:absolute p-4 rounded-lg sm:text-xs lg:text-lg md:text-md'>{fileName}</h2>
                    )}
                    <Modal onExcelUpload={onExcelUpload} />
                    <TableDisplay excelData={excelData} solutionId={solutionId} 
                        isExcelUploaded={isExcelUploaded} onExcelUpload={onExcelUpload} setIsExcelUploaded={setIsExcelUploaded} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;